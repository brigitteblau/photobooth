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

// Confetti dentro del marco. Posiciones relativas, SOLO en las zonas navy que
// no tapan las fotos: la franja del header (arriba) y la del pie (abajo).
type ConfettiType = "dot" | "tri" | "plus" | "spark";
const CONFETTI: { x: number; y: number; r: number; color: string; type: ConfettiType }[] = [
  // Header (arriba)
  { x: 0.07, y: 0.07, r: 11, color: "#3BA0FF", type: "dot" },
  { x: 0.14, y: 0.12, r: 13, color: "#9FEA18", type: "tri" },
  { x: 0.24, y: 0.06, r: 14, color: "#F2C50D", type: "spark" },
  { x: 0.3, y: 0.13, r: 12, color: "#A431FF", type: "plus" },
  { x: 0.7, y: 0.12, r: 12, color: "#FF6C31", type: "plus" },
  { x: 0.76, y: 0.06, r: 14, color: "#3BA0FF", type: "spark" },
  { x: 0.86, y: 0.12, r: 13, color: "#F2C50D", type: "tri" },
  { x: 0.93, y: 0.07, r: 11, color: "#9FEA18", type: "dot" },
  // Pie (abajo)
  { x: 0.08, y: 0.95, r: 11, color: "#A431FF", type: "dot" },
  { x: 0.18, y: 0.93, r: 13, color: "#F2C50D", type: "tri" },
  { x: 0.3, y: 0.96, r: 13, color: "#3BA0FF", type: "spark" },
  { x: 0.7, y: 0.96, r: 13, color: "#9FEA18", type: "spark" },
  { x: 0.82, y: 0.93, r: 13, color: "#FF6C31", type: "tri" },
  { x: 0.92, y: 0.95, r: 11, color: "#F2C50D", type: "dot" },
];

function drawConfetti(ctx: CanvasRenderingContext2D, w: number, h: number) {
  for (const c of CONFETTI) {
    ctx.fillStyle = c.color;
    const px = c.x * w;
    const py = c.y * h;
    const r = c.r;
    if (c.type === "dot") {
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    } else if (c.type === "tri") {
      ctx.beginPath();
      ctx.moveTo(px, py - r);
      ctx.lineTo(px + r, py + r);
      ctx.lineTo(px - r, py + r);
      ctx.closePath();
      ctx.fill();
    } else if (c.type === "plus") {
      const t = r * 0.42;
      ctx.fillRect(px - t, py - r, t * 2, r * 2);
      ctx.fillRect(px - r, py - t, r * 2, t * 2);
    } else {
      // spark: estrella de 4 puntas
      ctx.beginPath();
      ctx.moveTo(px, py - r);
      ctx.quadraticCurveTo(px, py, px + r, py);
      ctx.quadraticCurveTo(px, py, px, py + r);
      ctx.quadraticCurveTo(px, py, px - r, py);
      ctx.quadraticCurveTo(px, py, px, py - r);
      ctx.fill();
    }
  }
}

/**
 * UNA hoja A5 horizontal con las 4 fotos en grilla 2x2.
 * Navy a toda la hoja + borde rosa redondeado con margen. Pie ORT.
 */
export async function createCollage(photoList: string[]): Promise<string> {
  await ensureFonts();

  // A5 horizontal: 210 x 148 mm -> proporción 1.419. A 300 dpi.
  const width = 2480;
  const height = 1748;

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
  const margin = 52;
  ctx.strokeStyle = PINK;
  ctx.lineWidth = 12;
  roundRect(ctx, margin, margin, width - margin * 2, height - margin * 2, 64);
  ctx.stroke();

  // ---- Header: TIC E✚PERIENCE 2026 ----
  ctx.textBaseline = "alphabetic";
  ctx.font = "900 90px Raleway, Arial";
  ctx.textAlign = "left";
  const w1 = ctx.measureText("E").width;
  const w2 = ctx.measureText("PERIENCE").width;
  const crossSize = 100;
  const totalW = w1 + crossSize * 0.78 + w2;
  const sx = (width - totalW) / 2;
  const baseY = 180;

  ctx.font = "900 54px Raleway, Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("TIC", sx, baseY - 82);

  ctx.font = "900 90px Raleway, Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("E", sx, baseY);
  try {
    const cross = await loadImage("/stickers/cruz.svg");
    ctx.drawImage(cross, sx + w1 - 10, baseY - crossSize + 12, crossSize, crossSize);
  } catch {
    ctx.fillText("X", sx + w1, baseY);
  }
  ctx.fillText("PERIENCE", sx + w1 + crossSize * 0.78, baseY);

  try {
    const tag = await loadImage("/stickers/tag2026.svg");
    const tagW = 150;
    const tagH = (tag.height / tag.width) * tagW;
    ctx.drawImage(tag, sx + totalW - 45, baseY - 138, tagW, tagH);
  } catch {
    /* sin tag */
  }

  ctx.strokeStyle = PINK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(120, 232);
  ctx.lineTo(width - 120, 232);
  ctx.stroke();

  // ---- Fotos en grilla 2x2 ----
  const padX = 110;
  const gap = 34;
  const top = 250;
  const footerH = 160;
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
        roundRect(ctx, x, y, photoW, photoH, 28);
        ctx.clip();
        const scale = Math.max(photoW / img.width, photoH / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, x + (photoW - dw) / 2, y + (photoH - dh) / 2, dw, dh);
        ctx.restore();
      }

      ctx.strokeStyle = PINK;
      ctx.lineWidth = 7;
      roundRect(ctx, x, y, photoW, photoH, 28);
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
    const lh = 66;
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
