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
    <section className="relative z-10 grid w-full max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-[1.3fr_.7fr]">
      {/* Cámara con marco rosa */}
      <div className="relative overflow-hidden rounded-[34px] bg-[var(--pink)] p-3 shadow-2xl shadow-black/40">
        <div className="relative overflow-hidden rounded-[24px] bg-black/40">
          <video
            ref={videoRef}
            className="aspect-video w-full scale-x-[-1] object-cover"
            muted
            playsInline
          />

          <div className="pointer-events-none absolute left-4 right-4 top-4 h-px border-t border-dashed border-white/30" />

          {/* esquineros */}
          <div className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-[var(--pink)]" />
          <div className="pointer-events-none absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-[var(--pink)]" />
          <div className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-[var(--pink)]" />
          <div className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-[var(--pink)]" />

          {step === "camera" && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="scan-line absolute left-0 right-0 h-0.5 bg-[var(--pink)] shadow-[0_0_18px_var(--pink)]" />
            </div>
          )}

          {step === "countdown" && countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <span className="font-display countdown-pop text-[clamp(7rem,22vw,12rem)] text-white">
                {countdown}
              </span>
            </div>
          )}

          {step === "shooting" && (
            <div className="absolute inset-x-0 bottom-6 flex justify-center px-6">
              <div className="font-mono-tic rounded-full bg-[var(--lavender)]/85 px-6 py-3 text-sm tracking-[0.15em] text-white backdrop-blur">
                {(POSE_PROMPTS[poseIndex] || "Sonreí").toLowerCase()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel SECUENCIA */}
      <aside className="rounded-[34px] bg-[var(--pink)] p-7 shadow-2xl shadow-black/40">
        <h2 className="font-display text-4xl tracking-[-0.02em] text-white">SECUENCIA</h2>
        <p className="font-mono-tic mt-2 mb-6 text-sm leading-relaxed text-white/80">
          Se capturan 4 fotos y se arma tu collage.
        </p>

        <div className="mb-7 grid grid-cols-2 gap-4">
          {Array.from({ length: PHOTO_COUNT }).map((_, index) => {
            const isActive = scanningIndex === index;
            return (
              <div
                key={index}
                className={[
                  "relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl transition-all duration-300",
                  isActive
                    ? "bg-[var(--pink-soft)] ring-2 ring-white/70"
                    : "bg-white/15",
                ].join(" ")}
              >
                {photos[index] ? (
                  <>
                    <img
                      src={photos[index]}
                      alt={`Foto ${index + 1}`}
                      className="h-full w-full scale-x-[-1] object-cover"
                    />
                    {isActive && (
                      <div className="scan-reveal pointer-events-none absolute inset-0 bg-white/20" />
                    )}
                  </>
                ) : (
                  <span className="font-mono-tic text-sm tracking-[0.2em] text-white/55">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {cameraError ? (
          <p className="font-mono-tic text-sm text-white">{cameraError}</p>
        ) : (
          <button
            disabled={step === "countdown" || step === "shooting"}
            onClick={onStart}
            className="font-mono-tic w-full rounded-2xl bg-white/90 px-5 py-4 text-sm uppercase tracking-[0.2em] text-[var(--pink)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sacar fotos
          </button>
        )}
      </aside>
    </section>
  );
}
