## Context

The speech chat modal already has end-to-end plumbing for transcription (added by the `speech-user-transcript` change):

- `SpeechChatProvider.sendAudio` calls `POST /api/transcribe` right after recording stops, and patches the user message bubble in state with the transcript text when a non-empty string comes back.
- `AudioMessageBubble` renders `message.transcript ?? "Voice message"`.

The only missing piece is that `/api/transcribe` is a stub that always returns `transcript: null`. As a result, every user bubble shows the static text "Voice message" and the transcript field on the user message stays `undefined`.

## Goals / Non-Goals

**Goals:**
- Wire `/api/transcribe` to OpenAI Whisper (`whisper-1`) so it returns the spoken text.
- User audio bubbles display the transcribed text once the transcription resolves.
- No other code path is changed — the provider and UI are already correct.

**Non-Goals:**
- Streaming transcription or word-by-word animation.
- Changing how the chat API (`/api/speech/chat`) calls the downstream service.
- Storing transcripts server-side or building a history feature.

## Decisions

### Use the `openai` npm package with Whisper

**Decision:** Install `openai` (the official OpenAI Node.js SDK) and call `openai.audio.transcriptions.create` inside the `/api/transcribe` route.

**Rationale:** The SDK handles retries, streaming, and multipart encoding. Using it directly is simpler than raw `fetch` to the REST endpoint. The package is not yet in the project, so it needs to be added.

**Alternative considered:** Raw `fetch` to `https://api.openai.com/v1/audio/transcriptions` — valid, but more boilerplate for headers and error handling.

### Keep graceful degradation

**Decision:** If `OPENAI_API_KEY` is missing, or if Whisper returns an error, the route continues to return `transcript: null` (same shape as today). The provider already handles this gracefully — send still completes and the bubble shows "Voice message".

**Rationale:** The stub behaviour is the safe default. Adding the key makes it work; removing it or revoking it does not break the app.

### Model: `whisper-1`

**Decision:** Use `whisper-1`, the only publicly available Whisper model via the API.

### Language: auto-detect

**Decision:** Do not pass a `language` parameter — let Whisper auto-detect the language of the recording, since the app is multilingual (Greek, English).

## Risks / Trade-offs

- **Cost** → Each transcription call costs OpenAI credits. Mitigation: recordings are short (voice banking queries), and the call only happens on explicit send — no background polling.
- **Latency** → Whisper adds ~1–3 s to the send flow. The transcript appears asynchronously after the bubble is already visible, so perceived latency is low.
- **API key exposure** → `OPENAI_API_KEY` must stay server-side only (inside the route handler, never exported to the client). The existing `runtime = "nodejs"` declaration on the route ensures it never runs in the browser.
- **Audio format** → Browser `MediaRecorder` typically produces `audio/webm;codecs=opus`. Whisper accepts `webm`; the existing MIME-type normalisation in the route strips the codec suffix before the SDK call.

## Open Questions

- None — the implementation path is clear.
