"use client";

import { usePhotobooth } from "@/hooks/usePhotobooth";
import { IntroStep } from "@/components/steps/IntroStep";
import { CameraStep } from "@/components/steps/CameraStep";
import { ResultStep } from "@/components/steps/ResultStep";
import { Stickers } from "@/components/Stickers";

export function Photobooth() {
  const pb = usePhotobooth();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] p-6">
      <Stickers variant={pb.step === "intro" ? "full" : "confetti"} />

      {pb.flash && <div className="pointer-events-none fixed inset-0 z-50 bg-white/90" />}

      <header className="no-print absolute left-7 right-7 top-6 z-20 flex items-center justify-between">
        <span className="font-mono-tic text-xs uppercase tracking-[0.3em] text-white/40">ORT</span>
        <span className="font-mono-tic text-xs uppercase tracking-[0.3em] text-white/40">
          TIC Experience
        </span>
      </header>

      {pb.step === "intro" && <IntroStep onStart={pb.startCamera} />}

      {(pb.step === "camera" || pb.step === "countdown" || pb.step === "shooting") && (
        <CameraStep
          videoRef={pb.videoRef}
          step={pb.step}
          countdown={pb.countdown}
          photos={pb.photos}
          poseIndex={pb.poseIndex}
          scanningIndex={pb.scanningIndex}
          cameraError={pb.cameraError}
          onStart={pb.startExperience}
        />
      )}

      {(pb.step === "printing" || pb.step === "done") && pb.finalStrip && (
        <ResultStep
          finalStrip={pb.finalStrip}
          step={pb.step}
          printStatus={pb.printStatus}
          printError={pb.printError}
        />
      )}
    </main>
  );
}
