"use client";

import { useSpeechChat } from "@/components/speech/SpeechChatProvider";

export default function SpeechFab() {
  const { isOpen, open } = useSpeechChat();

  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open AI speech chat"
      className="fixed bottom-6 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-ai text-white ai-glow active:scale-95 transition-transform duration-150 focus:outline-none focus:ring-4 focus:ring-primary-navy/40"
    >
      <span className="text-lg font-bold tracking-tight select-none">AI</span>
    </button>
  );
}
