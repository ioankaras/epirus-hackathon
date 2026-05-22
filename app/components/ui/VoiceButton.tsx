"use client";

import { useState, useRef } from "react";
import TranscriptModal from "./TranscriptModal";

type VoiceStatus = "idle" | "recording" | "processing" | "error";

const MAX_RECORDING_MS = 10_000;

export default function VoiceButton() {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        await sendAudio();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");

      timeoutRef.current = setTimeout(() => stopRecording(), MAX_RECORDING_MS);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  function stopRecording() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setStatus("processing");
  }

  async function sendAudio() {
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");

    try {
      const res = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.transcript) {
        setTranscript(data.transcript);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
        return;
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }
    setStatus("idle");
  }

  function handleTap() {
    if (status === "idle") startRecording();
    else if (status === "recording") stopRecording();
  }

  const isDisabled = status === "processing";

  return (
    <>
      <button
        onClick={handleTap}
        disabled={isDisabled}
        aria-label={
          status === "idle"
            ? "Start voice command"
            : status === "recording"
            ? "Stop recording"
            : "Processing"
        }
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 select-none"
      >
        {status === "recording" && (
          <span className="absolute w-[72px] h-[72px] rounded-full bg-accent-red/40 animate-ping" />
        )}

        <span
          className={`flex items-center justify-center w-[72px] h-[72px] rounded-full shadow-lg transition-colors ${
            status === "recording"
              ? "bg-accent-red"
              : status === "error"
              ? "bg-accent-red/80"
              : "bg-primary-navy"
          } ${isDisabled ? "opacity-70" : ""}`}
        >
          {status === "processing" ? (
            <svg
              className="w-8 h-8 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
              />
            </svg>
          ) : (
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </span>

        <span
          className={`text-xs font-semibold ${
            status === "recording"
              ? "text-accent-red"
              : status === "error"
              ? "text-accent-red"
              : "text-primary-navy"
          }`}
        >
          {status === "idle" && "Μιλήστε"}
          {status === "recording" && "Ακούω..."}
          {status === "processing" && "Επεξεργάζομαι..."}
          {status === "error" && "Δεν κατάλαβα"}
        </span>
      </button>

      {transcript !== null && (
        <TranscriptModal
          transcript={transcript}
          onClose={() => setTranscript(null)}
        />
      )}
    </>
  );
}
