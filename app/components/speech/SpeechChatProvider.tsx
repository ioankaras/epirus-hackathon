"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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

export function SpeechChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [readAloudEnabled, setReadAloudEnabled] = useState(true);

  const isAwaitingReply = messages.some(
    (message) => message.role === "assistant" && message.kind === "loading",
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
  }, []);

  const sendAudio = useCallback(
    async (audioBlob: Blob) => {
      if (audioBlob.size === 0) return;

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

      // Attempt transcription; gracefully continue on failure or empty result
      let transcript: string | undefined;
      try {
        const transcribeForm = new FormData();
        transcribeForm.append(
          "audio",
          audioBlob,
          `speech-${Date.now()}.${getAudioFileExtension(mimeType)}`,
        );
        const transcribeResponse = await fetch("/api/transcribe", {
          method: "POST",
          body: transcribeForm,
        });
        if (transcribeResponse.ok) {
          const transcribeData = await transcribeResponse.json() as { transcript?: string | null };
          const text = transcribeData.transcript?.trim();
          if (text) {
            transcript = text;
            setMessages((prev) =>
              prev.map((message) =>
                message.id === userMessageId && message.role === "user"
                  ? { ...message, transcript }
                  : message,
              ),
            );
          }
        }
      } catch {
        // transcription is optional; proceed without it
      }

      try {
        const formData = new FormData();
        formData.append(
          "audio",
          audioBlob,
          `speech-${Date.now()}.${getAudioFileExtension(mimeType)}`,
        );
        if (transcript) {
          formData.append("transcript", transcript);
        }

        const response = await fetch("/api/speech/chat", {
          method: "POST",
          body: formData,
        });
        const data = (await response.json()) as SpeechChatResponse;

        if (!response.ok || !data.success || !data.reply?.text) {
          throw new Error(data.error || "Failed to send message");
        }

        const assistantText = data.reply.text;

        setMessages((prev) => {
          const withoutLoading = prev.filter(
            (message) => message.id !== loadingMessageId,
          );
          return [
            ...withoutLoading.map((message) =>
              message.id === userMessageId && message.role === "user"
                ? { ...message, status: "sent" as const }
                : message,
            ),
            {
              id: createId(),
              role: "assistant",
              kind: "text",
              text: assistantText,
            },
          ];
        });

        if (readAloudEnabled) {
          speakText(assistantText);
        }
      } catch {
        setMessages((prev) =>
          prev
            .filter((message) => message.id !== loadingMessageId)
            .map((message) =>
              message.id === userMessageId && message.role === "user"
                ? { ...message, status: "error" }
                : message,
            ),
        );
      }
    },
    [readAloudEnabled],
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
    }),
    [isOpen, open, close, messages, isAwaitingReply, readAloudEnabled, sendAudio],
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
