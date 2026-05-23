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

ΚΑΜΕΡΑ / ΣΚΑΝΑΡΙΣΜΑ:
- Κάλεσε το open_bill_scanner ΜΟΝΟ αν ο χρήστης ζητήσει ρητά να σκανάρει λογαριασμό ή να ανοίξει την κάμερα για πληρωμή.
- Για ερωτήσεις υπολοίπου, κινήσεων, εξόδων ή μεταφορών ΠΟΤΕ μην καλείς το open_bill_scanner. Χρησιμοποίησε τα εργαλεία MCP.`;

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
        {
          type: "function" as const,
          name: "open_bill_scanner",
          description:
            "Κάλεσε αυτό ΜΟΝΟ όταν ο χρήστης ζητήσει ρητά να σκανάρει λογαριασμό, barcode ή QR code με την κάμερα για πληρωμή λογαριασμού. ΜΗΝ το καλείς για ερωτήσεις υπολοίπου, κινήσεων, μεταφορών ή οτιδήποτε άλλο.",
          parameters: { type: "object" as const, properties: {}, additionalProperties: false },
          strict: true,
        },
      ],
    });

    console.log("OpenAI response output:", JSON.stringify(response.output, null, 2));

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

    const actions = response.output
      .filter((o) => o.type === "function_call")
      .map((o) => ("name" in o ? (o.name as string) : ""))
      .filter(Boolean);

    const finalReply = reply || (actions.includes("open_bill_scanner")
      ? "Ας ανοίξουμε την κάμερα για να σκανάρετε τον λογαριασμό σας."
      : "");

    return Response.json({ success: true, transcript, reply: finalReply, responseId: response.id, actions });
  } catch (e) {
    console.error("Transcribe/chat error:", e);
    return Response.json(
      { success: false, error: "failed" },
      { status: 500 },
    );
  }
}
