"use client";

import type { ReactNode } from "react";
import { Download, Printer, RotateCcw, Share2 } from "lucide-react";

interface PreviewStepProps {
  finalStrip: string;
  onShare: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onReset: () => void;
}

export function PreviewStep({
  finalStrip,
  onShare,
  onDownload,
  onPrint,
  onReset,
}: PreviewStepProps) {
  return (
    <section className="grid w-full max-w-[1100px] grid-cols-1 items-center gap-8 md:grid-cols-[auto_1fr]">
      <div className="strip-reveal mx-auto max-h-[82vh] overflow-hidden rounded-xl shadow-2xl shadow-black/60">
        <img src={finalStrip} alt="Tira final" className="max-h-[82vh] rounded-xl object-contain" />
      </div>

      <aside className="no-print flex flex-col gap-6 rounded-2xl border border-white/8 bg-white/3 p-8 backdrop-blur">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#FF5C2B]">
            ● Listo
          </p>
          <h2 className="mt-2 font-sans text-5xl font-bold tracking-[-0.05em] text-white">
            Tu tira
          </h2>
          <p className="mt-3 font-mono text-sm leading-relaxed text-white/35">
            Descargá, compartí o enviá a imprimir.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <ActionButton onClick={onShare} icon={<Share2 size={16} />} label="Compartir" accent />
          <ActionButton onClick={onDownload} icon={<Download size={16} />} label="Descargar" />
          <ActionButton onClick={onPrint} icon={<Printer size={16} />} label="Imprimir" />
          <ActionButton onClick={onReset} icon={<RotateCcw size={16} />} label="Otra tira" />
        </div>
      </aside>
    </section>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  accent = false,
}: {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-xl px-5 py-3.5 font-mono text-sm tracking-[0.1em] transition",
        accent
          ? "border border-[#FF5C2B]/50 bg-[#FF5C2B]/10 text-white hover:bg-[#FF5C2B]/20"
          : "border border-white/8 bg-white/4 text-white/70 hover:border-white/15 hover:text-white",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}