"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createStrip } from "@/lib/stripRenderer";

export type Step = "intro" | "camera" | "countdown" | "shooting" | "preview";

export const PHOTO_COUNT = 4;

export const POSE_PROMPTS = [
  "Primera toma",
  "Cambiá la pose",
  "Otra expresión",
  "Última",
];

const CAPTURE_DELAY_MS = 1200;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function usePhotobooth() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [step, setStep] = useState<Step>("intro");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [finalStrip, setFinalStrip] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [poseIndex, setPoseIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);

  const startCamera = useCallback(async () => {
    setCameraError("");
    setStep("camera");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError("No se pudo abrir la cámara. Revisá permisos.");
    }
  }, []);

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.04);
      data[i + 1] = Math.min(255, data[i + 1] * 1.04);
      data[i + 2] = Math.min(255, data[i + 2] * 1.04);
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL("image/png");
  }

  const startExperience = useCallback(async () => {
    setPhotos([]);
    setFinalStrip(null);
    setStep("countdown");

    for (let i = 3; i >= 1; i--) {
      setCountdown(i);
      await wait(1000);
    }

    setCountdown(null);
    setStep("shooting");

    const newPhotos: string[] = [];

    for (let i = 0; i < PHOTO_COUNT; i++) {
      setPoseIndex(i);
      await wait(CAPTURE_DELAY_MS);

      setFlash(true);
      const photo = capturePhoto();
      await wait(120);
      setFlash(false);

      if (photo) {
        newPhotos.push(photo);
        setPhotos([...newPhotos]);
        setScanningIndex(i);
        await wait(700);
        setScanningIndex(null);
      }

      await wait(500);
    }

    const strip = await createStrip(newPhotos);
    setFinalStrip(strip);
    setStep("preview");
  }, []);

  const downloadStrip = useCallback(() => {
    if (!finalStrip) return;

    const a = document.createElement("a");
    a.href = finalStrip;
    a.download = "tic-photobooth.png";
    a.click();
  }, [finalStrip]);

  const shareStrip = useCallback(async () => {
    if (!finalStrip) return;

    const blob = await (await fetch(finalStrip)).blob();
    const file = new File([blob], "tic-photobooth.png", { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: "TIC Experience Photobooth", files: [file] });
    } else {
      downloadStrip();
    }
  }, [downloadStrip, finalStrip]);

  const printStrip = useCallback(() => {
    window.print();
  }, []);

  const reset = useCallback(() => {
    setPhotos([]);
    setFinalStrip(null);
    setPoseIndex(0);
    setScanningIndex(null);
    setCountdown(null);
    setStep("camera");
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();

        if (step === "intro") {
          startCamera();
        }

        if (step === "camera") {
          startExperience();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step, startCamera, startExperience]);

  return {
    videoRef,
    step,
    countdown,
    photos,
    finalStrip,
    cameraError,
    poseIndex,
    flash,
    scanningIndex,
    startCamera,
    startExperience,
    shareStrip,
    downloadStrip,
    printStrip,
    reset,
  };
}