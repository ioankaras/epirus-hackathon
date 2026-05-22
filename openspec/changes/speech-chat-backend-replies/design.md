## Context

`SpeechChatProvider.sendAudio` already creates an object URL, appends a user audio bubble with `status: 'sending'`, POSTs to `/api/speech/chat`, then appends assistant text from `data.reply.text`. The API route uses `STUB_REPLIES` with a module-level index—this must go.

No separate speech microservice exists in the repo yet; integration uses an HTTP proxy pattern so a real service can be plugged in via env.

## Goals / Non-Goals

**Goals:**

- User sees their recording in a chat bubble immediately when capture completes.
- Assistant message appears only after `POST /api/speech/chat` resolves successfully with `reply.text` from the server chain.
- In-thread loading indicator between user send and assistant reply.
- API forwards audio to external service; no canned text in the Next route.

**Non-Goals:**

- Building the full speech/LLM microservice (only proxy contract + env).
- Whisper/sanitization logic inside this app (owned by downstream service).
- Streaming partial assistant tokens (single request/response for v1).

## Decisions

### 1. Optimistic user audio bubble, pessimistic assistant bubble

**Choice:** On `stopRecording`, append user audio bubble with `sending` immediately; append ephemeral `assistant` row with `kind: 'loading'` (or thread-level `isAwaitingReply`) until fetch completes; replace with text bubble on success or remove on error.

**Rationale:** Matches “write recording in chat bubble” + “wait for BE response.”

### 2. Remove stub; proxy via `SPEECH_SERVICE_URL`

**Choice:** `POST /api/speech/chat` forwards `multipart/form-data` audio to `${SPEECH_SERVICE_URL}/chat` (or `/v1/speech/chat`). Expect JSON `{ reply: { text: string }, messageId?: string }`. If env unset, return `503` with `{ success: false, error: "Speech service not configured" }`.

**Rationale:** No automated replies in app code; real service owns intelligence.

**Alternative:** Keep stub in dev — rejected per user request.

### 3. No client-side assistant text before response

**Choice:** Delete any path that sets assistant `text` without API success. TTS (`speechSynthesis`) runs only after `reply.text` is in state from the response.

**Rationale:** Explicit “no automated responses” on FE.

### 4. Audio bubble content

**Choice:** Keep `<audio controls src={audioUrl}>` in user bubble; optional label “Voice message” and duration if available from blob/recorder later.

**Rationale:** Already implemented; refine copy/states only.

### 5. Error handling

**Choice:** On non-2xx or missing `reply.text`, mark user bubble `error`, clear loading assistant row, do not append assistant text.

**Rationale:** Avoid showing fake success.

## Risks / Trade-offs

- **[No service in dev]** → 503 until `SPEECH_SERVICE_URL` set; document in README/.env.example.
- **[Long latency]** → loading row + disable record button while awaiting reply optional.
- **[Service contract drift]** → Document expected JSON in route GET metadata.

## Migration Plan

1. Extend types + provider for loading state.
2. Update modal UI for audio + loading assistant.
3. Replace stub route with proxy + 503 fallback.
4. Manual test with mock service or curl against route.

## Open Questions

- Exact downstream path (`/chat` vs `/speech/chat`) — **default `/chat`** on base URL, overridable later.
