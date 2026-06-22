// Marco de impresión (rama automatizacion): UNA sola hoja Carta (Letter) con
// las 4 fotos en grilla 2x2. El fondo navy ocupa toda la hoja (full-bleed),
// con un margen y un borde redondeado rosa TIC por dentro. Pie con logo ORT.

const NAVY = "#0C043F";
const PINK = "#FB276A";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar una imagen"));
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function ensureFonts() {
  try {
    if (typeof document !== "undefined" && document.fonts) {
      await document.fonts.load("900 64px Raleway");
      await document.fonts.load('400 24px "Roboto Mono"');
      await document.fonts.ready;
    }
  } catch {
    /* fuente por defecto */
  }
}

// Confetti chico dentro del marco (posiciones relativas).
const CONFETTI: { x: number; y: number; r: number; color: string; type: "dot" | "tri" }[] = [
  { x: 0.06, y: 0.16, r: 9, color: "#3BA0FF", type: "dot" },
  { x: 0.94, y: 0.15, r: 9, color: "#9FEA18", type: "dot" },
  { x: 0.06, y: 0.52, r: 10, color: "#A431FF", type: "tri" },
  { x: 0.95, y: 0.55, r: 9, color: "#FF6C31", type: "dot" },
  { x: 0.08, y: 0.86, r: 9, color: "#9FEA18", type: "dot" },
  { x: 0.92, y: 0.87, r: 10, color: "#F2C50D", type: "tri" },
];

function drawConfetti(ctx: CanvasRenderingContext2D, w: number, h: number) {
  for (const c of CONFETTI) {
    ctx.fillStyle = c.color;
    const px = c.x * w;
    const py = c.y * h;
    if (c.type === "dot") {
      ctx.beginPath();
      ctx.arc(px, py, c.r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(px, py - c.r);
      ctx.lineTo(px + c.r, py + c.r);
      ctx.lineTo(px - c.r, py + c.r);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/**
 * UNA hoja Carta (Letter horizontal) con las 4 fotos en grilla 2x2.
 * Navy a toda la hoja + borde rosa redondeado con margen. Pie ORT.
 */
export async function createCollage(photoList: string[]): Promise<string> {
  await ensureFonts();

  // Letter horizontal: 11 x 8.5 in -> proporción 1.294. A 300 dpi.
  const width = 3300;
  const height = 2550;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Fondo navy a toda la hoja (full-bleed, sin bordes blancos)
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, width, height);

  drawConfetti(ctx, width, height);

  // Borde rosa redondeado, con margen respecto al papel
  const margin = 70;
  ctx.strokeStyle = PINK;
  ctx.lineWidth = 16;
  roundRect(ctx, margin, margin, width - margin * 2, height - margin * 2, 90);
  ctx.stroke();

  // ---- Header: TIC E✚PERIENCE 2026 ----
  ctx.textBaseline = "alphabetic";
  ctx.font = "900 120px Raleway, Arial";
  ctx.textAlign = "left";
  const w1 = ctx.measureText("E").width;
  const w2 = ctx.measureText("PERIENCE").width;
  const crossSize = 132;
  const totalW = w1 + crossSize * 0.78 + w2;
  const sx = (width - totalW) / 2;
  const baseY = 320;

  ctx.font = "900 72px Raleway, Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("TIC", sx, baseY - 108);

  ctx.font = "900 120px Raleway, Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("E", sx, baseY);
  try {
    const cross = await loadImage("/stickers/cruz.svg");
    ctx.drawImage(cross, sx + w1 - 14, baseY - crossSize + 14, crossSize, crossSize);
  } catch {
    ctx.fillText("X", sx + w1, baseY);
  }
  ctx.fillText("PERIENCE", sx + w1 + crossSize * 0.78, baseY);

  try {
    const tag = await loadImage("/stickers/tag2026.svg");
    const tagW = 200;
    const tagH = (tag.height / tag.width) * tagW;
    ctx.drawImage(tag, sx + totalW - 60, baseY - 182, tagW, tagH);
  } catch {
    /* sin tag */
  }

  ctx.strokeStyle = PINK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(160, 400);
  ctx.lineTo(width - 160, 400);
  ctx.stroke();

  // ---- Fotos en grilla 2x2 ----
  const padX = 150;
  const gap = 44;
  const top = 470;
  const footerH = 220;
  const cols = 2;
  const rows = 2;
  const photoW = (width - padX * 2 - gap * (cols - 1)) / cols;
  const photoAreaH = height - top - footerH;
  const photoH = (photoAreaH - gap * (rows - 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const x = padX + c * (photoW + gap);
      const y = top + r * (photoH + gap);

      if (photoList[index]) {
        const img = await loadImage(photoList[index]);
        ctx.save();
        roundRect(ctx, x, y, photoW, photoH, 40);
        ctx.clip();
        const scale = Math.max(photoW / img.width, photoH / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, x + (photoW - dw) / 2, y + (photoH - dh) / 2, dw, dh);
        ctx.restore();
      }

      ctx.strokeStyle = PINK;
      ctx.lineWidth = 7;
      roundRect(ctx, x, y, photoW, photoH, 40);
      ctx.stroke();
    }
  }

  // ---- Pie: logo ORT (blanco sobre navy) ----
  // Lo centramos entre el final de las fotos y la línea inferior del borde
  // rosa, para que esa línea NO se superponga sobre el logo.
  const footerTop = top + photoAreaH; // donde terminan las fotos
  const borderBottom = height - margin; // línea inferior del borde rosa
  try {
    const logo = await loadImage("/ort-logo.png");
    const lh = 88;
    const lw = (logo.width / logo.height) * lh;
    const ly = footerTop + (borderBottom - footerTop - lh) / 2;
    ctx.drawImage(logo, (width - lw) / 2, ly, lw, lh);
  } catch {
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 48px Raleway, Arial";
    ctx.fillText("ORT", width / 2, footerTop + (borderBottom - footerTop) / 2 + 16);
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}
