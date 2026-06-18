const EVENT_NAME = "TIC Experience";
const SCHOOL_NAME = "ORT";
const FRAME_LABEL = "TIC PHOTOBOOTH";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
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

function drawNoise(ctx: CanvasRenderingContext2D, width: number, height: number) {
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const alpha = Math.random() * 0.04;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

export async function createStrip(photoList: string[]): Promise<string> {
  const width = 900;
  const height = 1840;
  const padding = 52;
  const gap = 28;
  const photoWidth = width - padding * 2;
  const photoHeight = 332;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#0d0d0b";
  roundRect(ctx, 0, 0, width, height, 24);
  ctx.fill();

  drawNoise(ctx, width, height);

  ctx.strokeStyle = "#FF5C2B";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, 134);
  ctx.lineTo(width - padding, 134);
  ctx.stroke();

  ctx.fillStyle = "#FF5C2B";
  ctx.font = "700 13px monospace";
  ctx.textAlign = "left";
  ctx.fillText("●  REC", padding, 60);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 36px Arial";
  ctx.textAlign = "center";
  ctx.fillText(FRAME_LABEL, width / 2, 102);

  ctx.fillStyle = "rgba(255,255,255,0.38)";
  ctx.font = "14px monospace";
  ctx.fillText(EVENT_NAME.toUpperCase(), width / 2, 122);

  let y = 154;

  for (let i = 0; i < photoList.length; i++) {
    const img = await loadImage(photoList[i]);

    ctx.save();
    roundRect(ctx, padding, y, photoWidth, photoHeight, 12);
    ctx.clip();

    const scale = Math.max(photoWidth / img.width, photoHeight / img.height);
    const drawnWidth = img.width * scale;
    const drawnHeight = img.height * scale;
    const dx = padding + (photoWidth - drawnWidth) / 2;
    const dy = y + (photoHeight - drawnHeight) / 2;
    ctx.drawImage(img, dx, dy, drawnWidth, drawnHeight);

    const grad = ctx.createLinearGradient(padding, y, padding + photoWidth, y);
    grad.addColorStop(0, "rgba(0,0,0,0.18)");
    grad.addColorStop(0.15, "rgba(0,0,0,0)");
    grad.addColorStop(0.85, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.18)");
    ctx.fillStyle = grad;
    ctx.fillRect(padding, y, photoWidth, photoHeight);

    ctx.restore();

    ctx.strokeStyle = i === photoList.length - 1 ? "rgba(255,92,43,0.5)" : "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, padding, y, photoWidth, photoHeight, 12);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`0${i + 1}`, width - padding - 8, y + 18);

    y += photoHeight + gap;
  }

  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, height - 110);
  ctx.lineTo(width - padding, height - 110);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 26px Arial";
  ctx.textAlign = "center";
  ctx.fillText(SCHOOL_NAME, width / 2, height - 76);

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "12px monospace";
  ctx.fillText(new Date().toLocaleDateString("es-AR"), width / 2, height - 52);

  ctx.strokeStyle = "#FF5C2B";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, height - 34);
  ctx.lineTo(width - padding, height - 34);
  ctx.stroke();

  return canvas.toDataURL("image/png");
}