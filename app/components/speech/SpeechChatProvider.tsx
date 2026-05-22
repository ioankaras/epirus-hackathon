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
      ]);

      try {
        const formData = new FormData();
        formData.append(
          "audio",
          audioBlob,
          `speech-${Date.now()}.${getAudioFileExtension(mimeType)}`,
        );

        const response = await fetch("/api/speech/chat", {
          method: "POST",
          body: formData,
        });
        const data = (await response.json()) as SpeechChatResponse;

        if (!response.ok || !data.success || !data.reply?.text) {
          throw new Error(data.error || "Failed to send message");
        }

        setMessages((prev) =>
          prev.map((message) =>
            message.id === userMessageId && message.role === "user"
              ? { ...message, status: "sent" }
              : message,
          ),
        );

        const assistantText = data.reply.text;
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            kind: "text",
            text: assistantText,
          },
        ]);

        if (readAloudEnabled) {
          speakText(assistantText);
        }
      } catch {
        setMessages((prev) =>
          prev.map((message) =>
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
      readAloudEnabled,
      setReadAloudEnabled,
      sendAudio,
    }),
    [isOpen, open, close, messages, readAloudEnabled, sendAudio],
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
