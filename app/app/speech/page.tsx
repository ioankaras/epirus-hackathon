"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";

type MicState =
  | "idle"
  | "requesting"
  | "listening"
  | "muted"
  | "paused"
  | "denied"
  | "unsupported"
  | "error";

type TranscriptionStatus = "idle" | "recording" | "sending" | "ready" | "error";

const idleWaveformBars = [18, 24, 32, 22, 28, 36, 26, 20, 30, 24, 34, 22];
const recordingMimeTypes = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/wav",
];

const statusText: Record<MicState, string> = {
  idle: "Ready",
  requesting: "Requesting...",
  listening: "Listening...",
  muted: "Muted",
  paused: "Paused",
  denied: "Microphone blocked",
  unsupported: "Microphone unavailable",
  error: "Microphone error",
};

const assistantText: Record<MicState, string> = {
  idle: "Tap the microphone when you are ready.",
  requesting: "Allow microphone access in your browser.",
  listening: "I can hear your microphone input.",
  muted: "Your microphone is muted.",
  paused: "Listening is paused.",
  denied: "Microphone permission was denied.",
  unsupported: "This browser does not support microphone capture.",
  error: "Something went wrong while opening the microphone.",
};

const transcriptionText: Record<TranscriptionStatus, string> = {
  idle: "Transcription upload is ready.",
  recording: "Recording audio for transcription.",
  sending: "Sending audio to the transcribe endpoint.",
  ready: "Audio reached the transcribe endpoint.",
  error: "Audio could not be prepared for transcription.",
};

function getSupportedRecordingMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return (
    recordingMimeTypes.find((mimeType) =>
      MediaRecorder.isTypeSupported(mimeType),
    ) ?? ""
  );
}

function getAudioFileExtension(mimeType: string) {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

export default function SpeechPage() {
  const [micState, setMicState] = useState<MicState>("idle");
  const [waveformBars, setWaveformBars] = useState(idleWaveformBars);
  const [transcriptionStatus, setTranscriptionStatus] =
    useState<TranscriptionStatus>("idle");
  const [transcriptionDetail, setTranscriptionDetail] = useState(
    transcriptionText.idle,
  );
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const autoStartedRef = useRef(false);

  const stopVisualizer = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const sendAudioForTranscription = useCallback(async (audioBlob: Blob) => {
    if (audioBlob.size === 0) {
      setTranscriptionStatus("idle");
      setTranscriptionDetail(transcriptionText.idle);
      return;
    }

    setTranscriptionStatus("sending");
    setTranscriptionDetail(transcriptionText.sending);

    try {
      const mimeType = audioBlob.type || "audio/webm";
      const formData = new FormData();
      formData.append(
        "audio",
        audioBlob,
        `speech-${Date.now()}.${getAudioFileExtension(mimeType)}`,
      );

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Transcription upload failed");
      }

      const sizeInKb = Math.max(1, Math.round(audioBlob.size / 1024));
      setTranscriptionStatus("ready");
      setTranscriptionDetail(
        `Uploaded ${sizeInKb} KB ${mimeType} audio to /api/transcribe.`,
      );
    } catch {
      setTranscriptionStatus("error");
      setTranscriptionDetail(transcriptionText.error);
    }
  }, []);

  const discardRecording = useCallback(() => {
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

  const stopRecordingForUpload = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    recorder.requestData();
    recorder.stop();
    mediaRecorderRef.current = null;
  }, []);

  const releaseMicrophone = useCallback(() => {
    stopVisualizer();
    discardRecording();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (audioContextRef.current?.state !== "closed") {
      void audioContextRef.current?.close();
    }
    audioContextRef.current = null;
    analyserRef.current = null;
  }, [discardRecording, stopVisualizer]);

  const startVisualizer = useCallback(() => {
    stopVisualizer();
    const analyser = analyserRef.current;
    if (!analyser) return;

    const activeAnalyser: AnalyserNode = analyser;
    const frequencyData = new Uint8Array(activeAnalyser.frequencyBinCount);

    function draw() {
      activeAnalyser.getByteFrequencyData(frequencyData);
      const binsPerBar = Math.max(
        1,
        Math.floor(frequencyData.length / idleWaveformBars.length),
      );

      const nextBars = idleWaveformBars.map((_, index) => {
        const start = index * binsPerBar;
        const end = Math.min(start + binsPerBar, frequencyData.length);
        let sum = 0;

        for (let i = start; i < end; i += 1) {
          sum += frequencyData[i];
        }

        const average = sum / Math.max(1, end - start);
        return Math.max(12, Math.min(100, Math.round(12 + average * 0.34)));
      });

      setWaveformBars(nextBars);
      animationFrameRef.current = window.requestAnimationFrame(draw);
    }

    draw();
  }, [stopVisualizer]);

  const startRecording = useCallback(
    (stream: MediaStream) => {
      if (typeof MediaRecorder === "undefined") {
        setTranscriptionStatus("error");
        setTranscriptionDetail("This browser cannot record uploadable audio.");
        return;
      }

      discardRecording();

      const mimeType = getSupportedRecordingMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      recordedChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      recorder.onstart = () => {
        setTranscriptionStatus("recording");
        setTranscriptionDetail(transcriptionText.recording);
      };
      recorder.onerror = () => {
        setTranscriptionStatus("error");
        setTranscriptionDetail("Could not record this microphone session.");
      };
      recorder.onstop = () => {
        const chunks = recordedChunksRef.current;
        recordedChunksRef.current = [];

        if (chunks.length === 0) {
          setTranscriptionStatus("idle");
          setTranscriptionDetail(transcriptionText.idle);
          return;
        }

        const audioBlob = new Blob(chunks, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });
        void sendAudioForTranscription(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
    },
    [discardRecording, sendAudioForTranscription],
  );

  const startListening = useCallback(async () => {
    if (micState === "requesting") return;

    const audioContextConstructor =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (!navigator.mediaDevices?.getUserMedia || !audioContextConstructor) {
      setMicState("unsupported");
      return;
    }

    releaseMicrophone();
    setMicState("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const audioContext = new audioContextConstructor();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.78;
      source.connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      await audioContext.resume();
      setMicState("listening");
      startRecording(stream);
      startVisualizer();
    } catch (error) {
      releaseMicrophone();
      setWaveformBars(idleWaveformBars);

      if (
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError")
      ) {
        setMicState("denied");
        return;
      }

      setMicState("error");
    }
  }, [micState, releaseMicrophone, startRecording, startVisualizer]);

  const handleMuteToggle = useCallback(async () => {
    if (!streamRef.current) {
      await startListening();
      return;
    }

    if (micState === "muted") {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
      await audioContextRef.current?.resume();
      setMicState("listening");
      startRecording(streamRef.current);
      startVisualizer();
      return;
    }

    if (micState === "listening" || micState === "paused") {
      if (micState === "listening") {
        stopRecordingForUpload();
      }
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
      stopVisualizer();
      setWaveformBars(idleWaveformBars);
      setMicState("muted");
    }
  }, [
    micState,
    startListening,
    startRecording,
    startVisualizer,
    stopRecordingForUpload,
    stopVisualizer,
  ]);

  const handlePauseToggle = useCallback(async () => {
    if (!streamRef.current) {
      await startListening();
      return;
    }

    if (micState === "paused") {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
      await audioContextRef.current?.resume();
      setMicState("listening");
      startRecording(streamRef.current);
      startVisualizer();
      return;
    }

    if (micState === "listening" || micState === "muted") {
      if (micState === "listening") {
        stopRecordingForUpload();
      }
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
      await audioContextRef.current?.suspend();
      stopVisualizer();
      setWaveformBars(idleWaveformBars);
      setMicState("paused");
    }
  }, [
    micState,
    startListening,
    startRecording,
    startVisualizer,
    stopRecordingForUpload,
    stopVisualizer,
  ]);

  useEffect(() => {
    return () => {
      releaseMicrophone();
    };
  }, [releaseMicrophone]);

  useEffect(() => {
    if (autoStartedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("autostart") !== "mic") return;

    autoStartedRef.current = true;
    window.history.replaceState(null, "", window.location.pathname);
    const timeoutId = window.setTimeout(() => {
      void startListening();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [startListening]);

  const isListening = micState === "listening";
  const statusDotClass =
    micState === "listening"
      ? "bg-success"
      : micState === "requesting"
        ? "bg-badge-orange"
        : micState === "denied" || micState === "error"
          ? "bg-accent-red"
          : "bg-white/25";
  const transcriptionDetailClass =
    transcriptionStatus === "ready"
      ? "text-success"
      : transcriptionStatus === "error"
        ? "text-accent-red"
        : "text-text-secondary";

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="AI Speech Mode" />

      <div className="px-5 py-6">
        <section className="bg-primary-navy text-white rounded-3xl px-5 py-7 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
                Voice assistant
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight">
                {statusText[micState]}
              </h1>
            </div>
            <div className={`flex h-12 min-w-12 items-center justify-center rounded-full ${statusDotClass} text-white`}>
              <span className="h-3 w-3 rounded-full bg-white" />
            </div>
          </div>

          <div className="relative mx-auto mt-10 flex h-64 w-full max-w-80 items-center justify-center">
            <div className={`absolute h-56 w-56 rounded-full border border-white/10 bg-white/5 ${isListening ? "animate-ping" : ""}`} />
            <div className="absolute h-44 w-44 rounded-full border border-white/15 bg-white/10" />
            <div className="absolute h-32 w-32 rounded-full border border-white/20 bg-white/15" />
            <button
              type="button"
              onClick={startListening}
              disabled={micState === "requesting"}
              className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white text-action-blue shadow-lg active:bg-gray-100 disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-white/40"
              aria-label="Start microphone input"
            >
              <svg
                className="h-11 w-11"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75v2.25m0-2.25a6 6 0 006-6m-6 6a6 6 0 01-6-6m6 2.25a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z"
                />
              </svg>
            </button>
          </div>

          <div className="mt-6 flex h-24 items-end justify-center gap-2 rounded-2xl bg-white/10 px-4 py-5">
            {waveformBars.map((height, index) => (
              <span
                key={`${height}-${index}`}
                className="w-2 rounded-full bg-white/80 animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 90}ms`,
                }}
              />
            ))}
          </div>
        </section>

        <section className="mt-5 flex flex-col gap-3">
          <div className="rounded-2xl bg-surface p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
              Assistant
            </p>
            <p className="mt-2 text-lg font-semibold text-primary-navy">
              {assistantText[micState]}
            </p>
            <p className={`mt-3 text-base ${transcriptionDetailClass}`}>
              {transcriptionDetail}
            </p>
          </div>

          <div className="rounded-2xl bg-action-blue/10 p-5 text-right">
            <p className="text-sm font-semibold uppercase tracking-wide text-action-blue">
              You
            </p>
            <p className="mt-2 text-lg font-semibold text-primary-navy">
              ...
            </p>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-2 items-center gap-4">
          <button
            type="button"
            onClick={handleMuteToggle}
            className="flex min-h-14 items-center justify-center rounded-full bg-surface text-primary-navy shadow-sm active:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-action-blue/40"
            aria-label={micState === "muted" ? "Unmute microphone" : "Mute microphone"}
          >
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25a3.75 3.75 0 10-7.5 0V9m7.5 0v2.25a3.75 3.75 0 01-6.12 2.91M15.75 9L4.5 20.25M8.25 9v2.25c0 .51.1 1 .28 1.44M12 18.75v2.25m0-2.25a7.5 7.5 0 006.94-4.66M5.06 14.09A7.47 7.47 0 014.5 11.25"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={handlePauseToggle}
            className="flex min-h-14 items-center justify-center rounded-full bg-surface text-primary-navy shadow-sm active:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-action-blue/40"
            aria-label={micState === "paused" ? "Resume listening" : "Pause listening"}
          >
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 7.5v9m4-9v9"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
