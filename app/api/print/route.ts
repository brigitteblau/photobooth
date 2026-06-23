import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, unlink, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

// La impresión usa binarios del sistema, sólo disponibles en el runtime de Node.
export const runtime = "nodejs";

const execFileP = promisify(execFile);
const IS_WINDOWS = process.platform === "win32";

// URL del Apps Script que guarda en Drive. Por defecto va incrustada para que
// suba en cualquier compu sin tener que configurar .env.local; igual se puede
// sobreescribir con la variable de entorno DRIVE_UPLOAD_URL.
const DEFAULT_DRIVE_URL =
  "https://script.google.com/macros/s/AKfycbzVXEB6l2XEB76c48bmcQAJplUa_9JhvqTbId2kolmJFF_XPlITAfbxF_59qfRBhoDHgA/exec";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * GET /api/print
 * Lista las impresoras instaladas. Abrí esta ruta en el navegador y copiá el
 * nombre EXACTO de tu impresora a PRINTER_NAME en .env.local.
 */
export async function GET() {
  try {
    if (IS_WINDOWS) {
      const { stdout } = await execFileP("powershell", [
        "-NoProfile",
        "-Command",
        "Get-Printer | Format-Table -AutoSize Name,PrinterStatus,Default",
      ]);
      return NextResponse.json({ ok: true, printers: stdout.trim() });
    }
    const { stdout } = await execFileP("lpstat", ["-p", "-d"]);
    return NextResponse.json({ ok: true, printers: stdout.trim() });
  } catch (err) {
    return NextResponse.json({ ok: false, error: errorMessage(err) }, { status: 500 });
  }
}

/**
 * POST /api/print
 * Body: { image: "data:image/png;base64,..." }
 * Guarda la imagen en un archivo temporal y la manda a la impresora SIN diálogo.
 *  - Windows: SumatraPDF (si SUMATRA_PATH está seteado) o, en su defecto, `mspaint /pt`.
 *  - macOS / Linux: `lp` (CUPS).
 */
export async function POST(req: NextRequest) {
  let tmpFile: string | null = null;

  try {
    const { image, driveImage } = (await req.json()) as {
      image?: string;
      driveImage?: string;
    };

    if (!image || !image.startsWith("data:image/")) {
      return NextResponse.json(
        { ok: false, error: "Falta 'image' o no es un data URL de imagen." },
        { status: 400 }
      );
    }

    const base64 = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    const stamp = Date.now();

    const dir = await mkdtemp(join(tmpdir(), "photobooth-"));
    tmpFile = join(dir, `strip-${stamp}.png`);
    await writeFile(tmpFile, buffer);

    // Copia digital de cada hoja en el Escritorio (sirve de respaldo y para
    // ver el resultado aunque no haya impresora conectada).
    let savedPath = "";
    try {
      const saveDir = join(homedir(), "Desktop", "photobooth-prints");
      await mkdir(saveDir, { recursive: true });
      savedPath = join(saveDir, `hoja-${stamp}.png`);
      await writeFile(savedPath, buffer);
    } catch {
      savedPath = "";
    }

    // Subida a Google Drive: SOLO una copia (driveImage = el collage). Si no
    // viene, sube la imagen de impresión. No frena ni rompe la impresión.
    const driveSrc =
      driveImage && driveImage.startsWith("data:image/") ? driveImage : image;
    const driveBase64 = driveSrc.replace(/^data:image\/\w+;base64,/, "");
    const driveUrl = process.env.DRIVE_UPLOAD_URL?.trim() || DEFAULT_DRIVE_URL;
    if (driveUrl) {
      try {
        await fetch(driveUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: driveBase64, mime: "image/jpeg", name: `tic-${stamp}.jpg` }),
        });
      } catch {
        /* si Drive falla, igual seguimos con la impresión */
      }
    }

    const printer = process.env.PRINTER_NAME?.trim();
    const copies = Math.max(1, parseInt(process.env.PRINT_COPIES?.trim() || "1", 10) || 1);

    try {
      const message = IS_WINDOWS
        ? await printWindows(tmpFile, printer, copies)
        : await printUnix(tmpFile, printer, copies);
      return NextResponse.json({ ok: true, message, savedPath });
    } catch (printErr) {
      // Si no hay impresora, igual guardamos la copia: no es un fallo total.
      if (savedPath) {
        return NextResponse.json({
          ok: true,
          message: `Sin impresora: se guardó la hoja en ${savedPath}`,
          savedPath,
          printError: errorMessage(printErr),
        });
      }
      throw printErr;
    }
  } catch (err) {
    return NextResponse.json({ ok: false, error: errorMessage(err) }, { status: 500 });
  } finally {
    // En Windows mspaint/Sumatra leen el archivo de forma asíncrona; le damos
    // unos segundos antes de borrarlo para no cortar el spool.
    if (tmpFile) {
      const file = tmpFile;
      setTimeout(() => unlink(file).catch(() => {}), 15000);
    }
  }
}

async function printUnix(file: string, printer: string | undefined, copies: number) {
  const media = process.env.PRINT_MEDIA?.trim();
  const args: string[] = [];
  if (printer) args.push("-d", printer); // sin -d usa la impresora default
  args.push("-n", String(copies));
  args.push("-o", "fit-to-page");
  if (media) args.push("-o", `media=${media}`); // ej: 4x6.Borderless, Custom.2x6in
  args.push(file);

  const { stdout } = await execFileP("lp", args);
  return stdout.trim() || "Enviado a la impresora (lp).";
}

async function printWindows(file: string, printer: string | undefined, copies: number) {
  const sumatra = process.env.SUMATRA_PATH?.trim();

  for (let i = 0; i < copies; i++) {
    if (sumatra) {
      // SumatraPDF: silencioso y respeta mejor el escalado/papel.
      const args = printer
        ? ["-print-to", printer, "-silent", file]
        : ["-print-to-default", "-silent", file];
      await execFileP(sumatra, args);
    } else {
      // mspaint viene con Windows. "/pt" = print to (silencioso, sin abrir Paint).
      const args = printer ? ["/pt", file, printer] : ["/pt", file];
      await execFileP("mspaint", args);
    }
    if (i < copies - 1) await wait(2000); // separar las copias para no pisar el spool
  }

  return sumatra
    ? "Enviado a la impresora (SumatraPDF)."
    : "Enviado a la impresora (mspaint).";
}

function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "stderr" in err) {
    const stderr = String((err as { stderr?: unknown }).stderr || "").trim();
    if (stderr) return stderr;
  }
  return err instanceof Error ? err.message : String(err);
}
