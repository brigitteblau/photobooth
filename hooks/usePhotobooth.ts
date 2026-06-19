"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createSheet, createStrip } from "@/lib/stripRenderer";

export type Step =
  | "intro"
  | "camera"
  | "countdown"
  | "shooting"
  | "printing"
  | "done";

export type PrintStatus = "idle" | "printing" | "ok" | "error";

export const PHOTO_COUNT = 4;

export const POSE_PROMPTS = [
  "Primera toma",
  "Cambiá la pose",
  "Otra expresión",
  "Última",
];

const CAPTURE_DELAY_MS = 1200;
// Tiempo que se muestra "retirá tu foto" antes de volver al estado listo.
const DONE_SCREEN_MS = 6000;
// Cuántas copias de la tira van en una misma hoja (probá 3 o 4 según se vea mejor).
const COPIES_PER_SHEET = 4;

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
  const [printStatus, setPrintStatus] = useState<PrintStatus>("idle");
  const [printError, setPrintError] = useState("");

  // Evita que un segundo botonazo dispare la secuencia mientras ya corre.
  const runningRef = useRef(false);

  const startCamera = useCallback(async () => {
    setCameraError("");
    setStep("camera");

    // Si ya hay un stream activo (re-arranque del loop) no lo pedimos de nuevo.
    if (videoRef.current?.srcObject) {
      await videoRef.current.play().catch(() => {});
      return;
    }

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

  // Manda la tira a la impresora vía la API local (CUPS / lp). Silenciosa.
  const sendToPrinter = useCallback(async (strip: string) => {
    setPrintStatus("printing");
    setPrintError("");

    try {
      const res = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: strip }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al imprimir");
      }
      setPrintStatus("ok");
    } catch (err) {
      setPrintStatus("error");
      setPrintError(err instanceof Error ? err.message : "Error al imprimir");
    }
  }, []);

  const reset = useCallback(() => {
    setPhotos([]);
    setFinalStrip(null);
    setPoseIndex(0);
    setScanningIndex(null);
    setCountdown(null);
    setPrintStatus("idle");
    setPrintError("");
    setStep("camera");
  }, []);

  // Secuencia completa y automática: countdown -> 4 fotos -> tira -> imprime -> vuelve.
  const startExperience = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    try {
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

      // Impresión automática, sin que la persona toque nada.
      // Se imprime una hoja con varias copias de la tira (para cortar).
      setStep("printing");
      const sheet = await createSheet(strip, COPIES_PER_SHEET);
      await sendToPrinter(sheet);

      // Pantalla de "retirá tu foto" y vuelta automática al estado listo.
      setStep("done");
      await wait(DONE_SCREEN_MS);
      reset();
    } finally {
      runningRef.current = false;
    }
  }, [reset, sendToPrinter]);

  // Botón físico (arcade USB / encoder configurado como Space).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();

      if (step === "intro") {
        startCamera();
      } else if (step === "camera") {
        startExperience();
      }
      // Durante countdown/shooting/printing/done el botón se ignora.
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
    printStatus,
    printError,
    startCamera,
    startExperience,
    reset,
  };
}
