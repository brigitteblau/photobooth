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

// URL del Apps Script que guarda en Drive. Va incrustada para que suba en
// cualquier compu sin configurar .env.local; se puede sobreescribir con la
// variable de entorno DRIVE_UPLOAD_URL.
const DEFAULT_DRIVE_URL =
  "https://script.google.com/macros/s/AKfycbzVXEB6l2XEB76c48bmcQAJplUa_9JhvqTbId2kolmJFF_XPlITAfbxF_59qfRBhoDHgA/exec";

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
 * POST /api/print  (rama solo-drive: NO imprime)
 * Body: { image: "data:image/png;base64,..." }
 * Guarda la imagen local (Escritorio/photobooth-prints) y la sube a Google Drive
 * (vía DRIVE_UPLOAD_URL). No envía nada a ninguna impresora.
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

    // MODO SOLO DRIVE: no se imprime. Se guarda local y se sube a Drive SOLO
    // una copia (driveImage = el collage); si no viene, sube la imagen recibida.
    const driveSrc =
      driveImage && driveImage.startsWith("data:image/") ? driveImage : image;
    const driveBase64 = driveSrc.replace(/^data:image\/\w+;base64,/, "");
    const driveUrl = process.env.DRIVE_UPLOAD_URL?.trim() || DEFAULT_DRIVE_URL;
    let driveOk = false;
    let driveError = "";
    if (driveUrl) {
      try {
        await fetch(driveUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: driveBase64, mime: "image/jpeg", name: `tic-${stamp}.jpg` }),
        });
        driveOk = true;
      } catch (err) {
        driveError = errorMessage(err);
      }
    }

    return NextResponse.json({
      ok: true,
      message: driveOk ? "Subida a Drive" : "Guardada local",
      savedPath,
      driveOk,
      ...(driveError ? { driveError } : {}),
    });
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

function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "stderr" in err) {
    const stderr = String((err as { stderr?: unknown }).stderr || "").trim();
    if (stderr) return stderr;
  }
  return err instanceof Error ? err.message : String(err);
}
