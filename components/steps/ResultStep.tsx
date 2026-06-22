"use client";

import { CheckCircle2, CloudOff, Loader2 } from "lucide-react";
import type { PrintStatus, Step } from "@/hooks/usePhotobooth";

interface ResultStepProps {
  finalStrip: string;
  step: Step;
  printStatus: PrintStatus;
  printError: string;
}

export function ResultStep({ finalStrip, step, printStatus, printError }: ResultStepProps) {
  const printing = step === "printing" || printStatus === "printing";
  const failed = printStatus === "error";

  return (
    <section className="relative z-10 grid w-full max-w-[1100px] grid-cols-1 items-center gap-8 md:grid-cols-[1.4fr_.6fr]">
      <div className="strip-reveal mx-auto max-h-[82vh] overflow-hidden rounded-2xl border-4 border-[var(--pink)] shadow-2xl shadow-black/50">
        <img src={finalStrip} alt="Tira final" className="max-h-[80vh] object-contain" />
      </div>

      <aside className="flex flex-col gap-6 rounded-[28px] bg-[var(--pink)] p-8 shadow-2xl shadow-black/40">
        {printing && (
          <>
            <Loader2 size={42} className="animate-spin text-white" />
            <div>
              <h2 className="font-display text-4xl tracking-[-0.02em] text-white">Guardando…</h2>
              <p className="font-mono-tic mt-3 text-sm leading-relaxed text-white/80">
                Tu foto se está subiendo. Esperá un momento.
              </p>
            </div>
          </>
        )}

        {!printing && !failed && (
          <>
            <CheckCircle2 size={42} className="text-white" />
            <div>
              <p className="font-mono-tic text-[10px] uppercase tracking-[0.35em] text-white/80">
                ● Listo
              </p>
              <h2 className="font-display mt-2 text-4xl tracking-[-0.02em] text-white">
                ¡Foto guardada!
              </h2>
              <p className="font-mono-tic mt-3 text-sm leading-relaxed text-white/80">
                Se subió a Drive. Preparando la próxima toma…
              </p>
            </div>
          </>
        )}

        {!printing && failed && (
          <>
            <CloudOff size={42} className="text-white" />
            <div>
              <h2 className="font-display text-3xl tracking-[-0.02em] text-white">
                No se pudo guardar
              </h2>
              <p className="font-mono-tic mt-3 text-sm leading-relaxed text-white/90">
                {printError || "Revisá la conexión a internet."}
              </p>
            </div>
          </>
        )}
      </aside>
    </section>
  );
}
