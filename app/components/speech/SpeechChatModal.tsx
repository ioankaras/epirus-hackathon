"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSpeechChat } from "@/components/speech/SpeechChatProvider";
import { useSpeechRecorder } from "@/components/speech/useSpeechRecorder";
import type { ChatMessage } from "@/lib/speech/types";

function AudioMessageBubble({
  message,
}: {
  message: Extract<ChatMessage, { kind: "audio" }>;
}) {
  const statusLabel =
    message.status === "sending"
      ? "Αποστολή…"
      : message.status === "error"
        ? "Αποτυχία αποστολής"
        : null;

  return (
    <div className="flex justify-end">
      <div className="max-w-[88%] rounded-3xl rounded-br-md bg-primary-navy px-5 py-4 text-white">
        <p className="text-xl text-white leading-snug">
          {message.transcript ?? "Φωνητικό μήνυμα"}
        </p>
        {statusLabel && (
          <p
            className={
              message.status === "error"
                ? "mt-1 text-base text-accent-red"
                : "mt-1 text-base text-white/70"
            }
          >
            {statusLabel}
          </p>
        )}
      </div>
    </div>
  );
}

function AssistantLoadingBubble() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] rounded-3xl rounded-bl-md bg-surface px-5 py-4 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-1">
          ΒΟΗΘΟΣ
        </p>
        <p className="text-xl text-text-secondary">
          Αναμονή για απάντηση…
        </p>
      </div>
    </div>
  );
}

function AssistantMessageBubble({
  message,
  onAction,
}: {
  message: Extract<ChatMessage, { kind: "text" }>;
  onAction?: (action: string) => void;
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] rounded-3xl rounded-bl-md bg-surface px-5 py-4 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-1">
          ΒΟΗΘΟΣ
        </p>
        <p className="text-xl text-primary-navy leading-snug">{message.text}</p>
        {message.actions?.includes("open_bill_scanner") && onAction && (
          <button
            type="button"
            onClick={() => onAction("open_bill_scanner")}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-action-blue px-4 py-4 text-lg font-semibold text-white shadow active:bg-action-blue-hover focus:outline-none focus:ring-4 focus:ring-action-blue/40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="7" y1="12" x2="17" y2="12" />
            </svg>
            Άνοιγμα κάμερας
          </button>
        )}
      </div>
    </div>
  );
}

export default function SpeechChatModal() {
  const {
    isOpen,
    close,
    messages,
    isAwaitingReply,
    readAloudEnabled,
    setReadAloudEnabled,
    sendAudio,
    stopPlayback,
    primeAudio,
  } = useSpeechChat();
  const router = useRouter();
  const { status, errorMessage, isRecording, toggleRecording, stopRecording } =
    useSpeechRecorder();
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleAction = useCallback(
    (action: string) => {
      if (action === "open_bill_scanner") {
        close();
        router.push("/bills?autoScan=true");
      }
    },
    [close, router],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) {
      void stopRecording();
    }
  }, [isOpen, stopRecording]);

  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    panelRef.current.focus();
  }, [isOpen]);

  const handleRecordToggle = useCallback(async () => {
    stopPlayback();
    // iOS Safari blocks audio.play() outside a user gesture. Call primeAudio()
    // synchronously here (before any await) to unlock an Audio element that
    // sendAudio will reuse when the TTS response arrives.
    primeAudio();
    const blob = await toggleRecording();
    if (blob) {
      await sendAudio(blob);
    }
  }, [toggleRecording, sendAudio, stopPlayback, primeAudio]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="speech-chat-title"
        tabIndex={-1}
        className="flex h-[100dvh] w-full flex-col bg-background outline-none"
      >
        <header className="shrink-0 flex items-center gap-3 min-h-[64px] bg-primary-navy border-l-[5px] border-accent-red px-4 py-4 shadow-sm">
          <h2
            id="speech-chat-title"
            className="flex-1 min-w-0 text-xl font-bold text-white leading-tight"
          >
            Βοηθός ΑΙ
          </h2>
          {/* Read aloud toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70 select-none">Ανάγνωση</span>
            <button
              type="button"
              role="switch"
              aria-checked={readAloudEnabled}
              onClick={() => setReadAloudEnabled(!readAloudEnabled)}
              className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                readAloudEnabled ? "bg-green-400" : "bg-white/30"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  readAloudEnabled ? "translate-x-[26px]" : "translate-x-[4px]"
                }`}
              />
            </button>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Κλείσιμο"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white active:bg-white/10 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <p className="text-center text-xl text-text-secondary px-4 leading-relaxed">
              Πατήστε το μικρόφωνο και μιλήστε
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message) => {
                if (message.role === "user") {
                  return (
                    <AudioMessageBubble key={message.id} message={message} />
                  );
                }
                if (message.kind === "loading") {
                  return <AssistantLoadingBubble key={message.id} />;
                }
                return (
                  <AssistantMessageBubble key={message.id} message={message} onAction={handleAction} />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-black/5 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          {errorMessage && (
            <p className="mb-2 text-base text-accent-red text-center">{errorMessage}</p>
          )}
          {status === "requesting" && (
            <p className="mb-2 text-base text-text-secondary text-center">
              Επιτρέψτε πρόσβαση στο μικρόφωνο…
            </p>
          )}
          <div className="relative">
            {isRecording && (
              <span className="absolute inset-0 rounded-2xl bg-accent-red/15 animate-ping" />
            )}
            <button
              type="button"
              onClick={() => void handleRecordToggle()}
              disabled={status === "requesting" || isAwaitingReply}
              aria-label={
                isRecording ? "Διακοπή ηχογράφησης και αποστολή" : "Έναρξη ηχογράφησης"
              }
              className={`relative w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-white shadow-lg focus:outline-none focus:ring-4 disabled:opacity-50 active:opacity-90 ${
                isRecording
                  ? "bg-accent-red focus:ring-accent-red/40"
                  : isAwaitingReply
                    ? "bg-action-blue focus:ring-action-blue/40"
                    : "bg-gradient-ai ai-glow focus:ring-action-blue/40"
              }`}
            >
              <span className="text-lg font-bold leading-tight">
                {isAwaitingReply
                  ? "Αναμονή για βοηθό…"
                  : isRecording
                    ? "Πατήστε για αποστολή"
                    : "Πατήστε να μιλήσετε"}
              </span>
              {isAwaitingReply ? (
                <svg className="h-6 w-6 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : isRecording ? (
                <span className="h-6 w-6 shrink-0 rounded-md bg-white" />
              ) : (
                <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75v2.25m0-2.25a6 6 0 006-6m-6 6a6 6 0 01-6-6m6 2.25a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" />
                </svg>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
