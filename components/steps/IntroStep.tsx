"use client";

interface IntroStepProps {
  onStart: () => void;
}

export function IntroStep({ onStart }: IntroStepProps) {
  return (
    <section className="relative z-10 flex flex-col items-center text-center">
      <h1 className="font-display leading-[0.82] tracking-[-0.03em]">
        <span className="block text-[clamp(4.5rem,15vw,12rem)] text-white">PHOTO</span>
        <span className="block text-[clamp(4.5rem,15vw,12rem)] text-[var(--lavender)]">
          BOOTH
        </span>
      </h1>

      <p className="font-mono-tic mt-4 text-[clamp(0.8rem,1.6vw,1.1rem)] uppercase tracking-[0.45em] text-[var(--lavender)]">
        Tic&nbsp;&nbsp;Experience&nbsp;&nbsp;2026
      </p>

      <button
        onClick={onStart}
        className="font-mono-tic mt-12 rounded-2xl border border-white/25 bg-[var(--surface)] px-14 py-5 text-lg uppercase tracking-[0.25em] text-white transition-all duration-300 hover:border-[var(--pink)] hover:bg-[var(--pink)]/20"
      >
        Empezar!
      </button>
    </section>
  );
}
