// Renderer alternativo (rama simulacion-pdf):
//  - createCollage: las 4 fotos de una persona en un cuadro 2x2 (no en tira).
//  - createA4Sheet: 4 copias de ese cuadro en una hoja tamaño A4 horizontal,
//    con líneas de corte, lista para previsualizar en PDF.

const EVENT_NAME = "TIC Experience";
const SCHOOL_NAME = "ORT";
const FRAME_LABEL = "TIC PHOTOBOOTH";

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

/**
 * Las 4 fotos en un cuadro 2x2 (2 arriba, 2 abajo) con la marca del evento.
 * Proporción ~A4/4 horizontal, para que al cortar la hoja cada copia quede
 * de un tamaño tipo foto 10x15.
 */
export async function createCollage(photoList: string[]): Promise<string> {
  const width = 1414;
  const height = 1000;
  const pad = 44;
  const headerH = 78;
  const footerH = 70;
  const gap = 18;
  const cols = 2;
  const rows = 2;

  const photoTop = pad + headerH;
  const photoW = (width - pad * 2 - gap * (cols - 1)) / cols;
  const photoAreaH = height - photoTop - footerH - pad;
  const photoH = (photoAreaH - gap * (rows - 1)) / rows;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Fondo
  ctx.fillStyle = "#0d0d0b";
  roundRect(ctx, 0, 0, width, height, 22);
  ctx.fill();

  // Header
  ctx.fillStyle = "#FF5C2B";
  ctx.font = "700 13px monospace";
  ctx.textAlign = "left";
  ctx.fillText("●  REC", pad, pad + 24);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 34px Arial";
  ctx.textAlign = "center";
  ctx.fillText(FRAME_LABEL, width / 2, pad + 34);

  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "13px monospace";
  ctx.fillText(EVENT_NAME.toUpperCase(), width / 2, pad + 58);

  ctx.strokeStyle = "#FF5C2B";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, photoTop - 8);
  ctx.lineTo(width - pad, photoTop - 8);
  ctx.stroke();

  // Fotos en grilla 2x2
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const x = pad + c * (photoW + gap);
      const y = photoTop + r * (photoH + gap);

      if (photoList[index]) {
        const img = await loadImage(photoList[index]);

        ctx.save();
        roundRect(ctx, x, y, photoW, photoH, 12);
        ctx.clip();

        const scale = Math.max(photoW / img.width, photoH / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, x + (photoW - dw) / 2, y + (photoH - dh) / 2, dw, dh);
        ctx.restore();
      }

      ctx.strokeStyle =
        index === photoList.length - 1 ? "rgba(255,92,43,0.5)" : "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, x, y, photoW, photoH, 12);
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.font = "11px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`0${index + 1}`, x + photoW - 8, y + 18);
    }
  }

  // Footer
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, height - footerH);
  ctx.lineTo(width - pad, height - footerH);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(SCHOOL_NAME, width / 2, height - footerH + 32);

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "12px monospace";
  ctx.fillText(new Date().toLocaleDateString("es-AR"), width / 2, height - footerH + 52);

  return canvas.toDataURL("image/png");
}

/**
 * Hoja A4 HORIZONTAL con 4 copias del collage (grilla 2x2) y líneas de corte.
 * El canvas tiene la proporción exacta de una A4 apaisada para que el PDF
 * muestre fielmente cómo va a quedar impreso.
 */
export async function createA4Sheet(collage: string): Promise<string> {
  // A4 apaisada: 297 x 210 mm -> proporción 1.4142. A 10 px/mm.
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

  // Líneas de corte punteadas
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

  // JPEG: mucho más liviano que PNG para fotos, así jsPDF lo incrusta bien.
  return canvas.toDataURL("image/jpeg", 0.92);
}
