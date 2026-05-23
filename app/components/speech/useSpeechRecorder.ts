"use client";

import { useCallback, useRef, useState } from "react";
import {
  getAudioFileExtension,
  getSupportedRecordingMimeType,
} from "@/lib/speech/audio-utils";

export type RecorderStatus = "idle" | "requesting" | "recording" | "error";

export function useSpeechRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const stopResolveRef = useRef<((blob: Blob | null) => void) | null>(null);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const discardRecorder = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    }
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
  }, []);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      releaseStream();
      setStatus("idle");
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      stopResolveRef.current = resolve;
      recorder.stop();
      mediaRecorderRef.current = null;
    });
  }, [releaseStream]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    if (status === "requesting" || status === "recording") return false;

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrorMessage("Microphone is not available in this browser.");
      return false;
    }

    if (typeof MediaRecorder === "undefined") {
      setStatus("error");
      setErrorMessage("This browser cannot record audio.");
      return false;
    }

    setStatus("requesting");
    setErrorMessage(null);
    discardRecorder();
    releaseStream();

    // Cancel any ongoing speech synthesis so the iOS audio session is free
    // before getUserMedia() is called. Otherwise the session may still be in
    // playback mode when recording starts, causing the first frames to be
    // silent or clipped.
    // Only cancel when something is actually queued/playing: calling cancel()
    // on an idle iOS speechSynthesis corrupts its state for the session,
    // causing all subsequent speak() calls to be silently ignored.
    if (typeof window !== "undefined") {
      const synth = window.speechSynthesis;
      if (synth && (synth.speaking || synth.pending)) {
        synth.cancel();
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mimeType = getSupportedRecordingMimeType();

      // Some mobile browsers (iOS Safari) report a mimeType as supported via
      // isTypeSupported but throw when passing it to the constructor.
      // Fall back to the browser's default if that happens.
      //
      // Also capture the effective MIME type at construction time. iOS Safari
      // has a bug where recorder.mimeType is an empty string even after
      // recording, so we cannot rely on it in onstop. When the constructor
      // fallback is used it means the probed mimeType was wrong (e.g. iOS
      // falsely reporting webm as supported); in that case iOS records
      // audio/mp4, so we use that as the effective type.
      let recorder: MediaRecorder;
      let effectiveMimeType: string;
      try {
        recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined,
        );
        effectiveMimeType = recorder.mimeType || mimeType || "audio/webm";
      } catch {
        recorder = new MediaRecorder(stream);
        effectiveMimeType = recorder.mimeType || "audio/mp4";
      }

      streamRef.current = stream;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setStatus("error");
        setErrorMessage("Could not record audio.");
        stopResolveRef.current?.(null);
        stopResolveRef.current = null;
        releaseStream();
      };

      recorder.onstop = () => {
        const chunks = recordedChunksRef.current;
        recordedChunksRef.current = [];
        releaseStream();

        const blob =
          chunks.length > 0
            ? new Blob(chunks, {
                type: recorder.mimeType || effectiveMimeType,
              })
            : null;

        setStatus("idle");
        stopResolveRef.current?.(blob);
        stopResolveRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
      return true;
    } catch (error) {
      releaseStream();
      setStatus("error");
      if (
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError")
      ) {
        setErrorMessage("Microphone permission was denied.");
      } else {
        setErrorMessage("Could not access the microphone.");
      }
      return false;
    }
  }, [discardRecorder, releaseStream, status]);

  const toggleRecording = useCallback(async (): Promise<Blob | null> => {
    if (status === "recording") {
      return stopRecording();
    }
    if (status === "idle" || status === "error") {
      const started = await startRecording();
      return started ? null : null;
    }
    return null;
  }, [startRecording, status, stopRecording]);

  return {
    status,
    errorMessage,
    isRecording: status === "recording",
    toggleRecording,
    stopRecording,
  };
}

export { getAudioFileExtension };
