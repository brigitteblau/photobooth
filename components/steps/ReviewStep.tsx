"use client";

import { Cloud, RotateCcw } from "lucide-react";

interface ReviewStepProps {
  finalStrip: string;
  onConfirm: () => void;
  onRetake: () => void;
}

export function ReviewStep({ finalStrip, onConfirm, onRetake }: ReviewStepProps) {
  return (
    <section className="relative z-10 grid w-full max-w-[1100px] grid-cols-1 items-center gap-8 md:grid-cols-[1.4fr_.6fr]">
      <div className="strip-reveal mx-auto max-h-[82vh] overflow-hidden rounded-2xl border-4 border-[var(--pink)] shadow-2xl shadow-black/50">
        <img src={finalStrip} alt="Tira final" className="max-h-[80vh] object-contain" />
      </div>

      <aside className="flex flex-col gap-6 rounded-[28px] bg-[var(--pink)] p-8 shadow-2xl shadow-black/40">
        <div>
          <p className="font-mono-tic text-[10px] uppercase tracking-[0.35em] text-white/80">
            ● ¿Te gustó?
          </p>
          <h2 className="font-display mt-2 text-4xl tracking-[-0.02em] text-white">
            Tu foto
          </h2>
          <p className="font-mono-tic mt-3 text-sm leading-relaxed text-white/80">
            Guardala si te gusta, o sacátela de nuevo.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="font-mono-tic flex w-full items-center justify-center gap-3 rounded-2xl bg-white/95 px-5 py-4 text-sm uppercase tracking-[0.2em] text-[var(--pink)] transition hover:bg-white"
          >
            <Cloud size={18} />
            Guardar foto
          </button>
          <button
            onClick={onRetake}
            className="font-mono-tic flex w-full items-center justify-center gap-3 rounded-2xl border border-white/60 px-5 py-4 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-white/15"
          >
            <RotateCcw size={18} />
            Volver a sacar
          </button>
        </div>
      </aside>
    </section>
  );
}
