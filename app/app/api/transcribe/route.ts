export const runtime = "nodejs";

import OpenAI from "openai";

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

  if (!(audio instanceof File) || audio.size === 0) {
    return Response.json({ success: false, error: "no_audio" }, { status: 400 });
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
      language: "el",
      prompt: PROMPT,
    });

    const transcript = transcription.text.trim();

    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: transcript,
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
        .filter((o: { type: string }) => o.type === "message")
        .map((o: { content: { type: string; text: string }[] }) =>
          o.content
            .filter((c) => c.type === "output_text")
            .map((c) => c.text)
            .join(""),
        )
        .join("") || "";

    return Response.json({ success: true, transcript, reply });
  } catch (e) {
    console.error("Transcribe/chat error:", e);
    return Response.json(
      { success: false, error: "failed" },
      { status: 500 },
    );
  }
}
