"use client";

// Fondo decorativo: stickers grandes (SVG del diseño) + confetti chico (recreado).
// variant "full" = inicio (stickers + confetti). variant "confetti" = solo confetti.

type BigSticker = { src: string; top: string; left: string; size: number; rot: number };

const BIG_STICKERS: BigSticker[] = [
  // Repartidos hacia los bordes; solo la cruz y el "2026" se superponen al título.
  { src: "/stickers/persona.svg", top: "12%", left: "8%", size: 90, rot: -8 },
  { src: "/stickers/cerebro-verde.svg", top: "9%", left: "26%", size: 92, rot: -6 },
  { src: "/stickers/pluma.svg", top: "8%", left: "72%", size: 94, rot: 10 },
  { src: "/stickers/pacman.svg", top: "14%", left: "88%", size: 80, rot: 8 },
  { src: "/stickers/satelite.svg", top: "66%", left: "9%", size: 108, rot: -10 },
  { src: "/stickers/celular.svg", top: "64%", left: "86%", size: 86, rot: 12 },
  // Estos dos sí se superponen al texto "PHOTO BOOTH":
  { src: "/stickers/tag2026.svg", top: "30%", left: "66%", size: 150, rot: -10 },
  { src: "/stickers/cruz.svg", top: "55%", left: "63%", size: 150, rot: 6 },
];

type Confetti = { type: "tulip" | "sparkle" | "dot" | "plus" | "triangle"; color: string; top: string; left: string; size: number; rot: number };

const COLORS = {
  yellow: "#F2C50D",
  blue: "#3BA0FF",
  purple: "#A431FF",
  green: "#9FEA18",
  orange: "#FF6C31",
  grey: "rgba(255,255,255,0.35)",
};

const CONFETTI: Confetti[] = [
  { type: "tulip", color: COLORS.yellow, top: "13%", left: "30%", size: 20, rot: 10 },
  { type: "tulip", color: COLORS.blue, top: "8%", left: "6%", size: 20, rot: -10 },
  { type: "tulip", color: COLORS.purple, top: "16%", left: "70%", size: 18, rot: 8 },
  { type: "tulip", color: COLORS.yellow, top: "12%", left: "92%", size: 18, rot: -6 },
  { type: "tulip", color: COLORS.green, top: "47%", left: "4%", size: 20, rot: 12 },
  { type: "tulip", color: COLORS.green, top: "92%", left: "25%", size: 20, rot: -8 },
  { type: "tulip", color: COLORS.purple, top: "88%", left: "63%", size: 18, rot: 6 },
  { type: "tulip", color: COLORS.yellow, top: "95%", left: "78%", size: 18, rot: 10 },
  { type: "tulip", color: COLORS.blue, top: "85%", left: "10%", size: 16, rot: -6 },
  { type: "sparkle", color: "#ffffff", top: "44%", left: "57%", size: 22, rot: 0 },
  { type: "sparkle", color: "rgba(255,255,255,0.7)", top: "78%", left: "36%", size: 18, rot: 0 },
  { type: "sparkle", color: "rgba(255,255,255,0.6)", top: "96%", left: "90%", size: 16, rot: 0 },
  { type: "plus", color: "rgba(255,255,255,0.45)", top: "37%", left: "73%", size: 16, rot: 0 },
  { type: "plus", color: "rgba(255,255,255,0.4)", top: "20%", left: "47%", size: 14, rot: 0 },
  { type: "plus", color: "rgba(255,255,255,0.4)", top: "92%", left: "47%", size: 14, rot: 0 },
  { type: "triangle", color: COLORS.orange, top: "13%", left: "45%", size: 18, rot: 0 },
  { type: "triangle", color: COLORS.orange, top: "42%", left: "92%", size: 16, rot: 20 },
  { type: "triangle", color: COLORS.orange, top: "97%", left: "16%", size: 16, rot: -10 },
  { type: "dot", color: COLORS.grey, top: "7%", left: "55%", size: 8, rot: 0 },
  { type: "dot", color: COLORS.grey, top: "27%", left: "9%", size: 8, rot: 0 },
  { type: "dot", color: COLORS.grey, top: "62%", left: "12%", size: 9, rot: 0 },
  { type: "dot", color: COLORS.grey, top: "78%", left: "8%", size: 8, rot: 0 },
  { type: "dot", color: COLORS.green, top: "82%", left: "94%", size: 9, rot: 0 },
  { type: "dot", color: COLORS.grey, top: "33%", left: "95%", size: 8, rot: 0 },
];

function ConfettiShape({ c }: { c: Confetti }) {
  const common = { width: c.size, height: c.size };
  let shape;
  if (c.type === "tulip") {
    shape = (
      <svg viewBox="0 0 24 24" {...common}>
        <path
          d="M12 3c2.5 2 4 4.5 4 7a4 4 0 1 1-8 0c0-2.5 1.5-5 4-7Z"
          fill={c.color}
        />
        <path d="M5 11c1.8.3 3 1.6 3.4 3.6-1.9.2-3.3-1-3.4-3.6Z" fill={c.color} />
        <path d="M19 11c-1.8.3-3 1.6-3.4 3.6 1.9.2 3.3-1 3.4-3.6Z" fill={c.color} />
      </svg>
    );
  } else if (c.type === "sparkle") {
    shape = (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M12 0c.6 6 5.4 11 12 12-6.6 1-11.4 6-12 12-.6-6-5.4-11-12-12C6.6 11 11.4 6 12 0Z" fill={c.color} />
      </svg>
    );
  } else if (c.type === "plus") {
    shape = (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8z" fill={c.color} />
      </svg>
    );
  } else if (c.type === "triangle") {
    shape = (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M12 4c.7 0 1.3.4 1.7 1l7 12c.8 1.4-.2 3-1.7 3H5c-1.5 0-2.5-1.6-1.7-3l7-12c.4-.6 1-1 1.7-1Z" fill={c.color} />
      </svg>
    );
  } else {
    shape = (
      <svg viewBox="0 0 24 24" {...common}>
        <circle cx="12" cy="12" r="11" fill={c.color} />
      </svg>
    );
  }
  return (
    <div
      className="absolute"
      style={{ top: c.top, left: c.left, transform: `rotate(${c.rot}deg)` }}
    >
      {shape}
    </div>
  );
}

export function Stickers({ variant = "full" }: { variant?: "full" | "confetti" }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${
        variant === "full" ? "z-30" : "z-0"
      }`}
    >
      {variant === "full" &&
        BIG_STICKERS.map((s, i) => (
          <img
            key={i}
            src={s.src}
            alt=""
            className="float-soft absolute"
            style={
              {
                top: s.top,
                left: s.left,
                width: s.size,
                "--rot": `${s.rot}deg`,
                transform: `rotate(${s.rot}deg)`,
                animationDelay: `${(i % 4) * 0.6}s`,
              } as React.CSSProperties
            }
          />
        ))}
      {CONFETTI.map((c, i) => (
        <ConfettiShape key={i} c={c} />
      ))}
    </div>
  );
}
