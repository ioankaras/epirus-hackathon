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
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-navy to-action-blue text-white shadow-lg active:opacity-95 focus:outline-none focus:ring-4 focus:ring-action-blue/40"
    >
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
    </button>
  );
}
