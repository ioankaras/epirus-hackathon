"use client";

import { useCallback, useEffect, useRef } from "react";
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
      ? "Sending…"
      : message.status === "error"
        ? "Failed to send"
        : null;

  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary-navy px-4 py-3 text-white">
        <p className="text-base text-white">
          {message.transcript ?? "Voice message"}
        </p>
        {statusLabel && (
          <p
            className={
              message.status === "error"
                ? "mt-1 text-sm text-accent-red"
                : "mt-1 text-sm text-white/70"
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
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-surface px-4 py-3 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Assistant
        </p>
        <p className="mt-1 text-base text-text-secondary">
          Waiting for response…
        </p>
      </div>
    </div>
  );
}

function AssistantMessageBubble({
  message,
}: {
  message: Extract<ChatMessage, { kind: "text" }>;
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-surface px-4 py-3 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Assistant
        </p>
        <p className="mt-1 text-base text-primary-navy">{message.text}</p>
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
  } = useSpeechChat();
  const { status, errorMessage, isRecording, toggleRecording } =
    useSpeechRecorder();
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (!isOpen || !panelRef.current) return;
    panelRef.current.focus();
  }, [isOpen]);

  const handleRecordToggle = useCallback(async () => {
    stopPlayback();
    const blob = await toggleRecording();
    if (blob) {
      await sendAudio(blob);
    }
  }, [toggleRecording, sendAudio, stopPlayback]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col pointer-events-none">
      <button
        type="button"
        aria-label="Close speech chat"
        className="pointer-events-auto flex-1 min-h-0 w-full bg-black/30 focus:outline-none"
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="speech-chat-title"
        tabIndex={-1}
        className="pointer-events-auto flex h-[75dvh] max-h-[75vh] min-h-[280px] w-full flex-col bg-background shadow-[0_-8px_30px_rgba(0,0,0,0.12)] outline-none"
      >
        <header className="shrink-0 border-b border-black/5 px-4 py-3">
          {/* Row 1: identity + close */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-ai ai-glow">
              <span className="text-xs font-bold text-white tracking-tight select-none">AI</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2
                id="speech-chat-title"
                className="text-base font-bold text-primary-navy leading-tight"
              >
                AI Assistant
              </h2>
              <p className="text-xs text-text-secondary leading-tight">
                Voice banking assistant
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-primary-navy shadow-sm active:bg-gray-100 focus:outline-none"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Row 2: read replies toggle */}
          <div className="mt-4 flex items-center gap-2 pl-12">
            <span className="text-xs text-text-secondary select-none">Read replies</span>
            <button
              type="button"
              role="switch"
              aria-checked={readAloudEnabled}
              onClick={() => setReadAloudEnabled(!readAloudEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                readAloudEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
                  readAloudEnabled ? "translate-x-[23px]" : "translate-x-[4px]"
                }`}
              />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {messages.length === 0 ? (
            <p className="text-center text-base text-text-secondary">
              Tap the microphone to send a voice message.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
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
                  <AssistantMessageBubble key={message.id} message={message} />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-black/5 px-4 py-3 pb-5">
          {errorMessage && (
            <p className="mb-3 text-sm text-accent-red">{errorMessage}</p>
          )}
          {status === "requesting" && (
            <p className="mb-3 text-sm text-text-secondary">
              Allow microphone access…
            </p>
          )}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => void handleRecordToggle()}
              disabled={status === "requesting" || isAwaitingReply}
              aria-label={
                isRecording ? "Stop recording and send" : "Start recording"
              }
              className={
                isRecording
                  ? "flex h-14 w-14 items-center justify-center rounded-full bg-accent-red text-white shadow-lg active:opacity-95 focus:outline-none focus:ring-4 focus:ring-accent-red/40 disabled:opacity-50"
                  : "flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-navy to-action-blue text-white shadow-lg active:opacity-95 focus:outline-none focus:ring-4 focus:ring-action-blue/40 disabled:opacity-50"
              }
            >
              {isRecording ? (
                <span className="h-5 w-5 rounded-sm bg-white" />
              ) : (
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75v2.25m0-2.25a6 6 0 006-6m-6 6a6 6 0 01-6-6m6 2.25a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z"
                  />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-3 text-center text-sm text-text-secondary">
            {isAwaitingReply
              ? "Waiting for assistant…"
              : isRecording
                ? "Tap to stop and send"
                : "Tap to record a voice message"}
          </p>
        </footer>
      </div>
    </div>
  );
}
