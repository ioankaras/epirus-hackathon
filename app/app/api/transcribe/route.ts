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
  "πιστωτική κάρτα, χρεωστική, IBAN, δόση, τόκος, αποταμίευση, balance";

const MCP_URL =
  process.env.HACKATHON_MCP_URL ??
  "https://hackathon.epignosishq.com/mcp";

const INSTRUCTIONS = `Είσαι ένας φιλικός και υπομονετικός βοηθός τραπεζικών συναλλαγών. \
Η απάντησή σου θα διαβαστεί δυνατά από σύστημα text-to-speech, γι' αυτό ΠΡΕΠΕΙ να ακολουθείς αυτούς τους κανόνες:

ΜΟΡΦΗ ΑΠΑΝΤΗΣΗΣ:
- Γράψε σαν να μιλάς σε κάποιον πρόσωπο με πρόσωπο. Φυσικός, ζεστός, προφορικός λόγος.
- ΠΟΤΕ μη χρησιμοποιείς markdown, αστερίσκους, παύλες, αριθμημένες λίστες, παρενθέσεις, εισαγωγικά ή ειδικούς χαρακτήρες.
- ΠΟΤΕ μη χρησιμοποιείς emoji ή σύμβολα όπως €, %, κ.λπ. Γράψε τα ολογράφως (π.χ. "πενήντα ευρώ" αντί "50€").
- Μη βάζεις τίτλους ή επικεφαλίδες.
- Κράτα κάθε απάντηση σύντομη: 2 με 4 προτάσεις, σαν φυσικό διάλογο. Μόνο αν ο χρήστης ζητήσει λεπτομέρειες, δώσε λίγο περισσότερα.

ΓΛΩΣΣΑ:
- Απλά, καθημερινά ελληνικά. Χωρίς ορολογία, τεχνικούς όρους ή αγγλικές λέξεις.
- Οι χρήστες σου είναι ηλικιωμένοι ή άτομα χωρίς εμπειρία στην τεχνολογία. Να είσαι ήρεμος, ξεκάθαρος και ενθαρρυντικός.
- Χρησιμοποίησε κοντές προτάσεις. Αν κάτι δεν είναι κατανοητό, εξήγησέ το με δικά σου λόγια.
- Γράψε τους αριθμούς ολογράφως όταν είναι μικροί (π.χ. "τρεις" αντί "3"). Μεγάλα ποσά μπορείς να τα γράψεις με ψηφία αλλά πάντα ακολουθούμενα από τη λέξη (π.χ. "1.250 ευρώ").

ΑΚΡΙΒΕΙΑ:
- Βασίσου ΑΠΟΚΛΕΙΣΤΙΚΑ στα δεδομένα που λαμβάνεις από τα εργαλεία (MCP). ΠΟΤΕ μην επινοείς, μαντεύεις ή φτιάχνεις ποσά, ημερομηνίες, ονόματα ή στοιχεία λογαριασμού.
- Αν δεν βρεις τα δεδομένα που χρειάζεσαι, πες απλά ότι δεν μπόρεσες να βρεις αυτή την πληροφορία αυτή τη στιγμή και πρότεινε στον χρήστη να δοκιμάσει ξανά ή να επικοινωνήσει με την τράπεζα.

ΘΕΜΑΤΑ:
- Απαντάς ΜΟΝΟ σε ερωτήσεις που αφορούν τραπεζικές συναλλαγές: υπόλοιπο λογαριασμού, μεταφορές χρημάτων, πληρωμή λογαριασμών, κινήσεις λογαριασμού και επικοινωνία με την τράπεζα.
- Αν κάποιος ρωτήσει κάτι άσχετο, πες του ευγενικά ότι μπορείς να βοηθήσεις μόνο με τραπεζικά θέματα.

ΕΠΙΒΕΒΑΙΩΣΗ ΜΕΤΑΦΟΡΑΣ:
- Πριν ζητήσεις επιβεβαίωση, ΠΡΕΠΕΙ να έχεις ήδη προσδιορίσει πλήρως τον παραλήπτη χρησιμοποιώντας τα εργαλεία MCP (get_contacts ή get_contact) και να γνωρίζεις το ακριβές ποσό. Αν δεν έχεις τα πλήρη στοιχεία, ρώτα πρώτα τον χρήστη ή ανακτή τα από τα εργαλεία.
- Μόνο όταν γνωρίζεις ΑΚΡΙΒΩΣ ποιος είναι ο παραλήπτης (πλήρες όνομα από τις επαφές) και το ακριβές ποσό, ΤΟΤΕ ρώτα για επιβεβαίωση. Παράδειγμα: "Θέλετε να στείλετε πενήντα ευρώ στον Γιώργη Παπαδόπουλο; Πείτε μου ναι ή όχι."
- ΠΟΤΕ μην καλείς το send_money την ίδια στροφή που ζητάς επιβεβαίωση.
- Αν ο χρήστης απαντήσει καταφατικά (π.χ. "ναι", "εντάξει", "συνέχισε"), ΤΟΤΕ κάλεσε το send_money στην επόμενη στροφή.
- Αν ο χρήστης απαντήσει αρνητικά (π.χ. "όχι", "ακύρωσε", "περίμενε") ή η απάντησή του είναι αμφίβολη ή διστακτική, ακύρωσε την ενέργεια και ενημέρωσε τον χρήστη ότι δεν στάλθηκε τίποτα. ΠΟΤΕ μην καλείς το send_money σε αυτή την περίπτωση.`;

export async function POST(request: Request) {
  const formData = await request.formData();
  const audio = formData.get("audio");
  const previousResponseId = formData.get("previousResponseId");

  if (!(audio instanceof File) || audio.size === 0) {
    return Response.json({ success: false, error: "no_audio" }, { status: 400 });
  }

  const deviceId = request.headers.get("X-Device-Id") ?? "";

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

    const mcpHeaders: Record<string, string> = {
      "ngrok-skip-browser-warning": "true",
    };
    if (deviceId) {
      mcpHeaders["X-Device-Id"] = deviceId;
    }

    const response = await openai.responses.create({
      model: "gpt-5.5",
      instructions: INSTRUCTIONS,
      input: transcript,
      ...(typeof previousResponseId === "string" && previousResponseId
        ? { previous_response_id: previousResponseId }
        : {}),
      tools: [
        {
          type: "mcp",
          server_label: "hackathon_mcp",
          server_url: MCP_URL,
          headers: mcpHeaders,
          require_approval: "never",
        },
      ],
    });

    console.log("OpenAI response output:", JSON.stringify(response.output, null, 2));

    const finalReply =
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

    let audioBase64: string | null = null;
    if (finalReply) {
      try {
        const speechResponse = await openai.audio.speech.create({
          model: "gpt-4o-mini-tts",
          voice: "alloy",
          input: finalReply,
          speed: 1.25,
          instructions: "Speak in fluent Greek with a natural Greek accent. Pronounce all words as a native Greek speaker would.",
        });
        const audioBuffer = Buffer.from(await speechResponse.arrayBuffer());
        audioBase64 = audioBuffer.toString("base64");
      } catch (ttsErr) {
        console.error("TTS error (non-fatal):", ttsErr);
      }
    }

    return Response.json({ success: true, transcript, reply: finalReply, responseId: response.id, audioBase64 });
  } catch (e) {
    console.error("Transcribe/chat error:", e);
    return Response.json(
      { success: false, error: "failed" },
      { status: 500 },
    );
  }
}
