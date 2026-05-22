"use client";

import { useEffect } from "react";
import { useSpeechChat } from "@/components/speech/SpeechChatProvider";

export default function OpenSpeechChatOnMount() {
  const { open } = useSpeechChat();

  useEffect(() => {
    open();
  }, [open]);

  return null;
}
