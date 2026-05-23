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
import type { ChatMessage, SpeechChatResponse } from "@/lib/speech/types";

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
};

const SpeechChatContext = createContext<SpeechChatContextValue | null>(null);

function createId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function speakText(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = document.documentElement.lang || "el-GR";
  window.speechSynthesis.speak(utterance);
}

function cancelSpeech() {
  if (typeof window !== "undefined") {
    window.speechSynthesis?.cancel();
  }
}

export function SpeechChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [readAloudEnabled, setReadAloudEnabled] = useState(true);
  const [responseId, setResponseId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isAwaitingReply = messages.some(
    (message) => message.role === "assistant" && message.kind === "loading",
  );

  const open = useCallback(() => setIsOpen(true), []);

  const stopPlayback = useCallback(() => {
    cancelSpeech();
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    stopPlayback();
  }, [stopPlayback]);

  const sendAudio = useCallback(
    async (audioBlob: Blob) => {
      if (audioBlob.size === 0) return;

      cancelSpeech();
      abortRef.current?.abort();
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
              { id: createId(), role: "assistant" as const, kind: "text" as const, text: reply },
            ]);
            if (readAloudEnabled) speakText(reply);
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
    [readAloudEnabled, responseId],
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
    }),
    [isOpen, open, close, messages, isAwaitingReply, readAloudEnabled, sendAudio, stopPlayback],
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
