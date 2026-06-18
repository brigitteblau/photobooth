"use client";

import { usePhotobooth } from "@/hooks/usePhotobooth";
import { IntroStep } from "@/components/steps/IntroStep";
import { CameraStep } from "@/components/steps/CameraStep";
import { PreviewStep } from "@/components/steps/PreviewStep";

export function Photobooth() {
  const pb = usePhotobooth();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080806] p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-125 w-175 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF5C2B]/5 blur-[120px]" />
      </div>

      {pb.flash && <div className="pointer-events-none fixed inset-0 z-50 bg-white/90" />}

      <header className="no-print absolute left-6 right-6 top-5 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/25">ORT</span>
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/25">
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

      {pb.step === "preview" && pb.finalStrip && (
        <PreviewStep
          finalStrip={pb.finalStrip}
          onShare={pb.shareStrip}
          onDownload={pb.downloadStrip}
          onPrint={pb.printStrip}
          onReset={pb.reset}
        />
      )}
    </main>
  );
}
