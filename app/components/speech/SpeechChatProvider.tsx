"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getAudioFileExtension } from "@/lib/speech/audio-utils";
import type { ChatMessage } from "@/lib/speech/types";

type SpeechChatContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  messages: ChatMessage[];
  isAwaitingReply: boolean;
  readAloudEnabled: boolean;
  setReadAloudEnabled: (enabled: boolean) => void;
  sendAudio: (audioBlob: Blob) => Promise<void>;
  stopPlayback: () => void;
  primeAudio: () => void;
};

const SpeechChatContext = createContext<SpeechChatContextValue | null>(null);

// Module-level: not tracked by React Compiler, appropriate for a transient
// Audio element that exists purely to unlock iOS/Android autoplay in the same
// gesture that starts recording.
let _primedAudio: HTMLAudioElement | null = null;

// Shortest valid silent WAV (0 samples). Used to unlock an Audio element via
// a user gesture so that setting .src + play() works later without a gesture.
const SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

function createId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function SpeechChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [readAloudEnabled, setReadAloudEnabled] = useState(true);
  const [responseId, setResponseId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isAwaitingReply = messages.some(
    (message) => message.role === "assistant" && message.kind === "loading",
  );

  const open = useCallback(() => setIsOpen(true), []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const primeAudio = useCallback(() => {
    const audio = new Audio(SILENT_WAV);
    _primedAudio = audio;
    void audio.play().catch(() => {});
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    stopPlayback();
    setMessages((prev) =>
      prev
        .filter((m) => m.kind !== "loading")
        .map((m) =>
          m.role === "user" && "status" in m && m.status === "sending"
            ? { ...m, status: "sent" as const }
            : m,
        ),
    );
  }, [stopPlayback]);

  const sendAudio = useCallback(
    async (audioBlob: Blob) => {
      if (audioBlob.size === 0) return;

      stopPlayback();
      const controller = new AbortController();
      abortRef.current = controller;

      const mimeType = audioBlob.type || "audio/webm";
      const audioUrl = URL.createObjectURL(audioBlob);
      const userMessageId = createId();
      const loadingMessageId = createId();

      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId,
          role: "user",
          kind: "audio",
          audioUrl,
          mimeType,
          status: "sending",
        },
        {
          id: loadingMessageId,
          role: "assistant",
          kind: "loading",
        },
      ]);

      try {
        const transcribeForm = new FormData();
        transcribeForm.append(
          "audio",
          audioBlob,
          `speech-${Date.now()}.${getAudioFileExtension(mimeType)}`,
        );
        if (responseId) {
          transcribeForm.append("previousResponseId", responseId);
        }
        const transcribeResponse = await fetch("/api/transcribe", {
          method: "POST",
          body: transcribeForm,
          signal: controller.signal,
        });
        if (transcribeResponse.ok) {
          const transcribeData = await transcribeResponse.json() as {
            success?: boolean;
            transcript?: string | null;
            reply?: string | null;
            responseId?: string | null;
            audioBase64?: string | null;
          };

          const text = transcribeData.transcript?.trim();
          if (text) {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === userMessageId && message.role === "user"
                  ? { ...message, transcript: text }
                  : message,
              ),
            );
          }

          const reply = transcribeData.reply?.trim();
          if (reply) {
            if (transcribeData.responseId) {
              setResponseId(transcribeData.responseId);
            }
            setMessages((prev) => [
              ...prev
                .filter((message) => message.id !== loadingMessageId)
                .map((message) =>
                  message.id === userMessageId && message.role === "user"
                    ? { ...message, status: "sent" as const }
                    : message,
                ),
              {
                id: createId(),
                role: "assistant" as const,
                kind: "text" as const,
                text: reply,
              },
            ]);
            if (readAloudEnabled && transcribeData.audioBase64) {
              const audio = _primedAudio ?? new Audio();
              _primedAudio = null;
              audio.src = `data:audio/mpeg;base64,${transcribeData.audioBase64}`;
              audioRef.current = audio;
              void audio.play();
            }
            return;
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }

      // Remove loading indicator and mark message as sent
      setMessages((prev) =>
        prev
          .filter((message) => message.id !== loadingMessageId)
          .map((message) =>
            message.id === userMessageId && message.role === "user"
              ? { ...message, status: "sent" as const }
              : message,
          ),
      );
    },
    [readAloudEnabled, responseId, stopPlayback],
  );

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
      messages,
      isAwaitingReply,
      readAloudEnabled,
      setReadAloudEnabled,
      sendAudio,
      stopPlayback,
      primeAudio,
    }),
    [isOpen, open, close, messages, isAwaitingReply, readAloudEnabled, sendAudio, stopPlayback, primeAudio],
  );

  return (
    <SpeechChatContext.Provider value={value}>
      {children}
    </SpeechChatContext.Provider>
  );
}

export function useSpeechChat() {
  const context = useContext(SpeechChatContext);
  if (!context) {
    throw new Error("useSpeechChat must be used within SpeechChatProvider");
  }
  return context;
}
