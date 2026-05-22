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
      recorder.requestData();
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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mimeType = getSupportedRecordingMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

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
                type: recorder.mimeType || mimeType || "audio/webm",
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
