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

export async function GET() {
  return Response.json({
    endpoint: "/api/transcribe",
    method: "POST",
    field: "audio",
    maxBytes: MAX_AUDIO_SIZE_BYTES,
    supportedTypes: Array.from(SUPPORTED_AUDIO_TYPES),
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

    return Response.json({
      success: true,
      readyForIntegration: true,
      received: {
        name: audio.name,
        size: audio.size,
        type: normalizedAudioType || "application/octet-stream",
      },
      transcript: null,
      message: "Audio upload received. Add OpenAI transcription here next.",
    });
  } catch {
    return Response.json(
      { success: false, error: "Invalid multipart form data" },
      { status: 400 },
    );
  }
}
