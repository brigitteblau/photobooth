"use client";

import { CheckCircle2, Loader2, Printer } from "lucide-react";
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
    <section className="grid w-full max-w-[1100px] grid-cols-1 items-center gap-8 md:grid-cols-[auto_1fr]">
      <div className="strip-reveal mx-auto max-h-[82vh] overflow-hidden rounded-xl shadow-2xl shadow-black/60">
        <img src={finalStrip} alt="Tira final" className="max-h-[82vh] rounded-xl object-contain" />
      </div>

      <aside className="flex flex-col gap-6 rounded-2xl border border-white/8 bg-white/3 p-8 backdrop-blur">
        {printing && (
          <>
            <Loader2 size={40} className="animate-spin text-[#FF5C2B]" />
            <div>
              <h2 className="font-sans text-5xl font-bold tracking-[-0.05em] text-white">
                Generando PDF…
              </h2>
              <p className="mt-3 font-mono text-sm leading-relaxed text-white/40">
                Preparando la simulación de impresión. Esperá un momento.
              </p>
            </div>
          </>
        )}

        {!printing && !failed && (
          <>
            <CheckCircle2 size={40} className="text-[#FF5C2B]" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#FF5C2B]">
                ● PDF listo
              </p>
              <h2 className="mt-2 font-sans text-5xl font-bold tracking-[-0.05em] text-white">
                Mirá el PDF
              </h2>
              <p className="mt-3 font-mono text-sm leading-relaxed text-white/40">
                Se abrió/descargó la simulación A4. Preparando la próxima…
              </p>
            </div>
          </>
        )}

        {!printing && failed && (
          <>
            <Printer size={40} className="text-red-300" />
            <div>
              <h2 className="font-sans text-4xl font-bold tracking-[-0.05em] text-white">
                No se pudo imprimir
              </h2>
              <p className="mt-3 font-mono text-sm leading-relaxed text-red-200/80">
                {printError || "Revisá que la impresora esté encendida y configurada."}
              </p>
            </div>
          </>
        )}
      </aside>
    </section>
  );
}
