"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OpenSpeechChatOnMount from "@/components/speech/OpenSpeechChatOnMount";

export default function SpeechPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return <OpenSpeechChatOnMount />;
}
