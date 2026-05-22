export const runtime = "nodejs";

import OpenAI from "openai";

const openai = new OpenAI();

const PROMPT =
  "Μεταφορά, υπόλοιπο, λογαριασμός, πληρωμή, κατάθεση, ανάληψη, " +
  "πιστωτική κάρτα, χρεωστική, IBAN, δόση, τόκος, αποταμίευση";

export async function POST(request: Request) {
  const formData = await request.formData();
  const audio = formData.get("audio") as File | null;

  if (!audio) {
    return Response.json({ transcript: "", error: "no_audio" }, { status: 400 });
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
      language: "el",
      prompt: PROMPT,
    });

    return Response.json({ transcript: transcription.text });
  } catch (e) {
    console.error("Transcription error:", e);
    return Response.json(
      { transcript: "", error: "transcription_failed" },
      { status: 500 },
    );
  }
}
