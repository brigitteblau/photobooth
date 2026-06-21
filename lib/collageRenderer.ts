// Renderer del marco de impresión (rama simulacion-pdf):
//  - createCollage: marco TIC EXPERIENCE 2026 con las 4 fotos en grilla 2x2 y
//    el pie ORT, fondo navy con borde rosa y confetti (como el diseño).
//  - createA4Sheet: 4 copias de ese marco en una hoja A4 horizontal, con líneas
//    de corte, para previsualizar en PDF.

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
      await document.fonts.load('900 64px Raleway');
      await document.fonts.load('400 24px "Roboto Mono"');
      await document.fonts.ready;
    }
  } catch {
    /* si falla, se usa la fuente por defecto */
  }
}

// Confetti chico dentro del marco (posiciones relativas al ancho/alto).
const CONFETTI: { x: number; y: number; r: number; color: string; type: "dot" | "tri" }[] = [
  { x: 0.07, y: 0.2, r: 7, color: "#3BA0FF", type: "dot" },
  { x: 0.93, y: 0.18, r: 7, color: "#9FEA18", type: "dot" },
  { x: 0.5, y: 0.13, r: 7, color: "#F2C50D", type: "tri" },
  { x: 0.06, y: 0.55, r: 8, color: "#A431FF", type: "tri" },
  { x: 0.95, y: 0.6, r: 7, color: "#FF6C31", type: "dot" },
  { x: 0.1, y: 0.85, r: 7, color: "#9FEA18", type: "dot" },
  { x: 0.9, y: 0.86, r: 8, color: "#F2C50D", type: "tri" },
  { x: 0.5, y: 0.93, r: 6, color: "#3BA0FF", type: "dot" },
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
 * Las 4 fotos en grilla 2x2 dentro del marco TIC EXPERIENCE 2026 (con ORT).
 * Proporción ~A4/4 horizontal, para que al cortar la hoja cada copia quede
 * de un tamaño tipo foto 10x15.
 */
export async function createCollage(photoList: string[]): Promise<string> {
  await ensureFonts();

  const width = 1414;
  const height = 1000;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Fondo navy + borde rosa
  ctx.fillStyle = NAVY;
  roundRect(ctx, 0, 0, width, height, 28);
  ctx.fill();
  ctx.lineWidth = 14;
  ctx.strokeStyle = PINK;
  roundRect(ctx, 7, 7, width - 14, height - 14, 24);
  ctx.stroke();

  drawConfetti(ctx, width, height);

  // ---- Header: TIC EXPERIENCE (con la cruz como X) + 2026 ----
  ctx.textBaseline = "alphabetic";
  ctx.font = '900 78px Raleway, Arial';
  ctx.textAlign = "left";

  const part1 = "E";
  const part2 = "PERIENCE";
  const w1 = ctx.measureText(part1).width;
  const w2 = ctx.measureText(part2).width;
  const crossSize = 86;
  const totalW = w1 + crossSize * 0.78 + w2;
  const sx = (width - totalW) / 2;
  const baseY = 168;

  // "TIC" arriba, alineado a la izquierda con EXPERIENCE
  ctx.font = '900 48px Raleway, Arial';
  ctx.fillStyle = "#ffffff";
  ctx.fillText("TIC", sx, baseY - 70);

  // "EXPERIENCE" con la cruz como X
  ctx.font = '900 78px Raleway, Arial';
  ctx.fillStyle = "#ffffff";
  ctx.fillText(part1, sx, baseY);
  try {
    const cross = await loadImage("/stickers/cruz.svg");
    ctx.drawImage(cross, sx + w1 - 10, baseY - crossSize + 10, crossSize, crossSize);
  } catch {
    ctx.fillText("X", sx + w1, baseY);
  }
  ctx.fillText(part2, sx + w1 + crossSize * 0.78, baseY);

  // Etiqueta 2026
  try {
    const tag = await loadImage("/stickers/tag2026.svg");
    const tagW = 130;
    const tagH = (tag.height / tag.width) * tagW;
    ctx.drawImage(tag, sx + totalW - 40, baseY - 118, tagW, tagH);
  } catch {
    /* sin tag */
  }

  // Línea bajo el header
  ctx.strokeStyle = PINK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 210);
  ctx.lineTo(width - 60, 210);
  ctx.stroke();

  // ---- Fotos en grilla 2x2 ----
  const pad = 56;
  const gap = 22;
  const top = 238;
  const footerH = 96;
  const cols = 2;
  const rows = 2;
  const photoW = (width - pad * 2 - gap * (cols - 1)) / cols;
  const photoAreaH = height - top - footerH;
  const photoH = (photoAreaH - gap * (rows - 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const x = pad + c * (photoW + gap);
      const y = top + r * (photoH + gap);

      if (photoList[index]) {
        const img = await loadImage(photoList[index]);
        ctx.save();
        roundRect(ctx, x, y, photoW, photoH, 14);
        ctx.clip();
        const scale = Math.max(photoW / img.width, photoH / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, x + (photoW - dw) / 2, y + (photoH - dh) / 2, dw, dh);
        ctx.restore();
      }

      ctx.strokeStyle = PINK;
      ctx.lineWidth = 6;
      roundRect(ctx, x, y, photoW, photoH, 14);
      ctx.stroke();
    }
  }

  // ---- Pie: ORT ----
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = '900 34px Raleway, Arial';
  ctx.fillText("ORT", width / 2, height - footerH + 52);
  ctx.font = '400 18px "Roboto Mono", monospace';
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("Educando para la vida", width / 2, height - footerH + 78);

  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Hoja A4 HORIZONTAL con 4 copias del marco (grilla 2x2) y líneas de corte.
 * El canvas tiene la proporción exacta de una A4 apaisada para que el PDF
 * muestre fielmente cómo va a quedar impreso.
 */
export async function createA4Sheet(collage: string): Promise<string> {
  const width = 2970;
  const height = 2100;
  const margin = 70;
  const gap = 70;
  const cols = 2;
  const rows = 2;

  const cellW = (width - margin * 2 - gap * (cols - 1)) / cols;
  const cellH = (height - margin * 2 - gap * (rows - 1)) / rows;

  const img = await loadImage(collage);
  const scale = Math.min(cellW / img.width, cellH / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return collage;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellX = margin + c * (cellW + gap);
      const cellY = margin + r * (cellH + gap);
      ctx.drawImage(img, cellX + (cellW - dw) / 2, cellY + (cellH - dh) / 2, dw, dh);
    }
  }

  ctx.save();
  ctx.strokeStyle = "#9aa0a6";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([10, 10]);
  for (let c = 1; c < cols; c++) {
    const lineX = margin + c * cellW + (c - 0.5) * gap;
    ctx.beginPath();
    ctx.moveTo(lineX, margin / 2);
    ctx.lineTo(lineX, height - margin / 2);
    ctx.stroke();
  }
  for (let r = 1; r < rows; r++) {
    const lineY = margin + r * cellH + (r - 0.5) * gap;
    ctx.beginPath();
    ctx.moveTo(margin / 2, lineY);
    ctx.lineTo(width - margin / 2, lineY);
    ctx.stroke();
  }
  ctx.restore();

  return canvas.toDataURL("image/jpeg", 0.92);
}
