export const runtime = "nodejs";

import OpenAI from "openai";

function audioExtensionFromMime(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4") || mimeType.includes("m4a") || mimeType.includes("aac")) return "mp4";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  return "webm";
}

const openai = new OpenAI();

const PROMPT =
  "Μεταφορά, υπόλοιπο, λογαριασμός, πληρωμή, κατάθεση, ανάληψη, " +
  "πιστωτική κάρτα, χρεωστική, IBAN, δόση, τόκος, αποταμίευση";

const MCP_URL =
  process.env.HACKATHON_MCP_URL ??
  "https://hackathon.epignosishq.com/mcp";

export async function POST(request: Request) {
  const formData = await request.formData();
  const audio = formData.get("audio");
  const previousResponseId = formData.get("previousResponseId");

  if (!(audio instanceof File) || audio.size === 0) {
    return Response.json({ success: false, error: "no_audio" }, { status: 400 });
  }

  try {
    const ext = audioExtensionFromMime(audio.type);
    const namedAudio = audio.name.endsWith(`.${ext}`)
      ? audio
      : new File([audio], `speech.${ext}`, { type: audio.type });

    const transcription = await openai.audio.transcriptions.create({
      file: namedAudio,
      model: "whisper-1",
      language: "el",
      prompt: PROMPT,
    });

    const transcript = transcription.text.trim();

    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: transcript,
      ...(typeof previousResponseId === "string" && previousResponseId
        ? { previous_response_id: previousResponseId }
        : {}),
      tools: [
        {
          type: "mcp",
          server_label: "hackathon_mcp",
          server_url: MCP_URL,
          headers: { "ngrok-skip-browser-warning": "true" },
          require_approval: "never",
        },
      ],
    });

    const reply =
      response.output
        .filter((o) => o.type === "message")
        .map((o) =>
          "content" in o
            ? o.content
                .filter((c) => c.type === "output_text")
                .map((c) => ("text" in c ? c.text : ""))
                .join("")
            : "",
        )
        .join("") || "";

    return Response.json({ success: true, transcript, reply, responseId: response.id });
  } catch (e) {
    console.error("Transcribe/chat error:", e);
    return Response.json(
      { success: false, error: "failed" },
      { status: 500 },
    );
  }
}
