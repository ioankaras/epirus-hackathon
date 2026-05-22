export const runtime = "nodejs";

const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024;
const SUPPORTED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/mpga",
  "audio/m4a",
  "audio/wav",
  "audio/webm",
]);

const STUB_REPLIES = [
  "I received your voice message. How can I help with your banking today?",
  "Thanks for speaking. You can ask about your balance, send money, or pay bills.",
  "I am ready to assist. Tell me what you would like to do next.",
];

let replyIndex = 0;

export async function GET() {
  return Response.json({
    endpoint: "/api/speech/chat",
    method: "POST",
    field: "audio",
    maxBytes: MAX_AUDIO_SIZE_BYTES,
    supportedTypes: Array.from(SUPPORTED_AUDIO_TYPES),
    responseShape: {
      success: true,
      messageId: "string",
      reply: { text: "string" },
    },
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return Response.json(
        { success: false, error: "Missing audio file" },
        { status: 400 },
      );
    }

    if (audio.size === 0) {
      return Response.json(
        { success: false, error: "Audio file is empty" },
        { status: 400 },
      );
    }

    if (audio.size > MAX_AUDIO_SIZE_BYTES) {
      return Response.json(
        { success: false, error: "Audio file is too large" },
        { status: 413 },
      );
    }

    const normalizedAudioType = audio.type.split(";")[0].toLowerCase();

    if (audio.type && !SUPPORTED_AUDIO_TYPES.has(normalizedAudioType)) {
      return Response.json(
        {
          success: false,
          error: `Unsupported audio type: ${audio.type}`,
        },
        { status: 415 },
      );
    }

    const replyText = STUB_REPLIES[replyIndex % STUB_REPLIES.length];
    replyIndex += 1;

    return Response.json({
      success: true,
      messageId: `msg-${Date.now()}`,
      reply: { text: replyText },
    });
  } catch {
    return Response.json(
      { success: false, error: "Invalid multipart form data" },
      { status: 400 },
    );
  }
}
