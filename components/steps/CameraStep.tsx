"use client";

import type { RefObject } from "react";
import { PHOTO_COUNT, POSE_PROMPTS, type Step } from "@/hooks/usePhotobooth";

interface CameraStepProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  step: Step;
  countdown: number | null;
  photos: string[];
  poseIndex: number;
  scanningIndex: number | null;
  cameraError: string;
  onStart: () => void;
}

export function CameraStep({
  videoRef,
  step,
  countdown,
  photos,
  poseIndex,
  scanningIndex,
  cameraError,
  onStart,
}: CameraStepProps) {
  return (
    <section className="no-print grid w-full max-w-6xl grid-cols-1 items-center gap-7 md:grid-cols-[1.25fr_.75fr]">
      <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-white/5 p-3 shadow-2xl backdrop-blur">
        <div className="relative overflow-hidden rounded-[28px] bg-black/30">
          <video
            ref={videoRef}
            className="aspect-video w-full scale-x-[-1] object-cover"
            muted
            playsInline
          />

          <div className="pointer-events-none absolute inset-0 border border-white/18" />
          <div className="pointer-events-none absolute left-4 right-4 top-4 h-px border-t border-dashed border-white/12" />

          <div className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l border-t border-[#FF5C2B]" />
          <div className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r border-t border-[#FF5C2B]" />
          <div className="pointer-events-none absolute left-3 bottom-3 h-5 w-5 border-b border-l border-[#FF5C2B]" />
          <div className="pointer-events-none absolute right-3 bottom-3 h-5 w-5 border-b border-r border-[#FF5C2B]" />

          {step === "camera" && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="scan-line absolute left-0 right-0 h-0.5 bg-[#FF5C2B]/85 shadow-[0_0_18px_rgba(255,92,43,0.85)]" />
            </div>
          )}

          {step === "countdown" && countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="countdown-pop text-[clamp(7rem,22vw,11rem)] font-bold tracking-[-0.08em] text-white">
                {countdown}
              </span>
            </div>
          )}

          {step === "shooting" && (
            <div className="absolute inset-x-0 bottom-6 flex justify-center px-6">
              <div className="rounded-full border border-[#FF5C2B]/35 bg-black/72 px-5 py-3 font-mono text-xs uppercase tracking-[0.24em] text-white/90 backdrop-blur">
                {POSE_PROMPTS[poseIndex] || "Sonreí"}
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="rounded-[36px] border border-white/12 bg-white/5 p-7 backdrop-blur">
        <h2 className="mb-2 text-3xl font-semibold tracking-[-0.04em] text-white">Secuencia</h2>
        <p className="mb-6 text-sm leading-relaxed text-white/50">
          Se capturan cuatro fotos y se genera una tira vertical.
        </p>

        <div className="mb-7 grid grid-cols-2 gap-3">
          {Array.from({ length: PHOTO_COUNT }).map((_, index) => {
            const isActive = scanningIndex === index;

            return (
              <div
                key={index}
                className={[
                  "relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border bg-black/35 transition-all duration-300",
                  isActive
                    ? "border-[#FF5C2B]/70 shadow-[0_0_0_1px_rgba(255,92,43,0.25),0_0_22px_rgba(255,92,43,0.28)]"
                    : "border-white/10",
                ].join(" ")}
              >
                {photos[index] ? (
                  <>
                    <img
                      src={photos[index]}
                      alt={`Foto ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {isActive && (
                      <div className="scan-reveal pointer-events-none absolute inset-0 bg-[#FF5C2B]/20" />
                    )}
                  </>
                ) : (
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-white/25">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {cameraError ? (
          <p className="text-sm text-red-200">{cameraError}</p>
        ) : (
          <button
            disabled={step === "countdown" || step === "shooting"}
            onClick={onStart}
            className="w-full rounded-xl border border-[#FF5C2B]/50 bg-[#FF5C2B]/10 px-5 py-3.5 font-mono text-sm uppercase tracking-widest text-white transition hover:bg-[#FF5C2B]/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sacar fotos
          </button>
        )}
      </aside>
    </section>
  );
}