export type ChatMessageStatus = "sending" | "sent" | "error";

export type ChatMessage =
  | {
      id: string;
      role: "user";
      kind: "audio";
      audioUrl: string;
      mimeType: string;
      status: ChatMessageStatus;
      transcript?: string;
    }
  | {
      id: string;
      role: "assistant";
      kind: "text";
      text: string;
    }
  | {
      id: string;
      role: "assistant";
      kind: "loading";
    };

export type SpeechChatResponse = {
  success: boolean;
  messageId?: string;
  reply?: { text: string };
  error?: string;
};
