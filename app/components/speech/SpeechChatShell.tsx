"use client";

import type { ReactNode } from "react";
import { SpeechChatProvider } from "@/components/speech/SpeechChatProvider";
import SpeechChatModal from "@/components/speech/SpeechChatModal";
import SpeechFab from "@/components/speech/SpeechFab";

export default function SpeechChatShell({ children }: { children: ReactNode }) {
  return (
    <SpeechChatProvider>
      {children}
      <SpeechFab />
      <SpeechChatModal />
    </SpeechChatProvider>
  );
}
