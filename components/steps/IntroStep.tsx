"use client";

import { Camera } from "lucide-react";

interface IntroStepProps {
  onStart: () => void;
}

export function IntroStep({ onStart }: IntroStepProps) {
  return (
    <section className="max-w-2xl text-center">
      <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.4em] text-[#FF5C2B]">
        ● TIC Experience - Photobooth
      </p>

      <h1 className="mb-6 font-sans text-[clamp(4rem,12vw,9rem)] font-bold leading-[0.88] tracking-[-0.05em] text-white">
        Photo
        <br />
        <span className="text-white/25">booth</span>
      </h1>

      <p className="mx-auto mb-10 max-w-sm font-mono text-sm leading-relaxed text-white/40">
        Cuatro tomas. Una tira. Lista para compartir.
      </p>

      <button
        onClick={onStart}
        className="group relative overflow-hidden rounded-full border border-white/15 bg-white/5 px-10 py-4 font-mono text-sm uppercase tracking-[0.2em] text-white transition-all duration-300 hover:border-[#FF5C2B]/50 hover:bg-[#FF5C2B]/10"
      >
        <span className="relative z-10 flex items-center gap-3">
          <Camera size={16} />
          Comenzar
        </span>
      </button>

      <p className="mt-6 font-mono text-xs text-white/20">Space para activar</p>
    </section>
  );
}