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

function getSpeechServiceUrl() {
  const url = process.env.SPEECH_SERVICE_URL?.trim();
  return url ? url.replace(/\/$/, "") : "";
}

export async function GET() {
  return Response.json({
    endpoint: "/api/speech/chat",
    method: "POST",
    field: "audio",
    maxBytes: MAX_AUDIO_SIZE_BYTES,
    supportedTypes: Array.from(SUPPORTED_AUDIO_TYPES),
    speechServiceUrlConfigured: Boolean(getSpeechServiceUrl()),
    downstreamPath: "/chat",
    responseShape: {
      success: true,
      messageId: "string",
      reply: { text: "string" },
    },
    serviceResponseShape: {
      messageId: "string (optional)",
      reply: { text: "string" },
      error: "string (optional)",
    },
  });
}

export async function POST(request: Request) {
  const speechServiceUrl = getSpeechServiceUrl();

  if (!speechServiceUrl) {
    return Response.json(
      {
        success: false,
        error: "Speech service not configured",
      },
      { status: 503 },
    );
  }

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

    const transcript = formData.get("transcript");

    const outbound = new FormData();
    outbound.append(
      "audio",
      audio,
      audio.name || `speech-${Date.now()}.webm`,
    );
    if (typeof transcript === "string" && transcript.trim()) {
      outbound.append("transcript", transcript.trim());
    }

    const serviceResponse = await fetch(`${speechServiceUrl}/chat`, {
      method: "POST",
      body: outbound,
    });

    let serviceData: {
      success?: boolean;
      messageId?: string;
      reply?: { text?: string };
      error?: string;
    };

    try {
      serviceData = await serviceResponse.json();
    } catch {
      return Response.json(
        { success: false, error: "Speech service returned invalid JSON" },
        { status: 502 },
      );
    }

    const replyText = serviceData.reply?.text?.trim();

    if (!serviceResponse.ok || !replyText) {
      return Response.json(
        {
          success: false,
          error:
            serviceData.error ||
            `Speech service error (${serviceResponse.status})`,
        },
        { status: serviceResponse.ok ? 502 : serviceResponse.status },
      );
    }

    return Response.json({
      success: true,
      messageId: serviceData.messageId ?? `msg-${Date.now()}`,
      reply: { text: replyText },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      return Response.json(
        { success: false, error: "Speech service unreachable" },
        { status: 502 },
      );
    }

    return Response.json(
      { success: false, error: "Invalid multipart form data" },
      { status: 400 },
    );
  }
}
