"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSpeechChat } from "@/components/speech/SpeechChatProvider";
import { useSpeechRecorder } from "@/components/speech/useSpeechRecorder";
import type { ChatMessage } from "@/lib/speech/types";

function AudioMessageBubble({ message }: { message: Extract<ChatMessage, { kind: "audio" }> }) {
  const statusLabel =
    message.status === "sending"
      ? "Sending…"
      : message.status === "error"
        ? "Failed to send"
        : null;

  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary-navy px-4 py-3 text-white">
        <audio
          controls
          src={message.audioUrl}
          className="w-full max-w-[220px] h-10"
          preload="metadata"
        />
        {statusLabel && (
          <p
            className={
              message.status === "error"
                ? "mt-2 text-sm text-accent-red"
                : "mt-2 text-sm text-white/70"
            }
          >
            {statusLabel}
          </p>
        )}
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
    readAloudEnabled,
    setReadAloudEnabled,
    sendAudio,
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
    const blob = await toggleRecording();
    if (blob) {
      await sendAudio(blob);
    }
  }, [toggleRecording, sendAudio]);

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
        className="pointer-events-auto flex h-[50dvh] max-h-[50vh] min-h-[280px] w-full flex-col rounded-t-3xl bg-background shadow-[0_-8px_30px_rgba(0,0,0,0.12)] outline-none"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
          <div>
            <h2
              id="speech-chat-title"
              className="text-lg font-bold text-primary-navy"
            >
              AI Speech
            </h2>
            <p className="text-sm text-text-secondary">
              Voice banking assistant
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={readAloudEnabled}
                onChange={(event) =>
                  setReadAloudEnabled(event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-action-blue focus:ring-action-blue/40"
              />
              Read replies
            </label>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-primary-navy shadow-sm active:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-action-blue/40"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <p className="text-center text-base text-text-secondary">
              Tap the microphone to send a voice message.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((message) =>
                message.role === "user" ? (
                  <AudioMessageBubble key={message.id} message={message} />
                ) : (
                  <AssistantMessageBubble key={message.id} message={message} />
                ),
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-black/5 px-5 py-4 pb-6">
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
              disabled={status === "requesting"}
              aria-label={
                isRecording ? "Stop recording and send" : "Start recording"
              }
              className={
                isRecording
                  ? "flex h-16 w-16 items-center justify-center rounded-full bg-accent-red text-white shadow-lg active:opacity-95 focus:outline-none focus:ring-4 focus:ring-accent-red/40"
                  : "flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-navy to-action-blue text-white shadow-lg active:opacity-95 focus:outline-none focus:ring-4 focus:ring-action-blue/40"
              }
            >
              {isRecording ? (
                <span className="h-5 w-5 rounded-sm bg-white" />
              ) : (
                <svg
                  className="h-8 w-8"
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
            {isRecording
              ? "Tap to stop and send"
              : "Tap to record a voice message"}
          </p>
        </footer>
      </div>
    </div>
  );
}
