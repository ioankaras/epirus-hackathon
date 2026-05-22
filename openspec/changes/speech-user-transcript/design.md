## Context

`SpeechChatProvider.sendAudio` currently: creates an object URL, appends user audio bubble with `status: 'sending'`, appends loading assistant bubble, POSTs audio to `/api/speech/chat`, updates thread on success/error.

`/api/transcribe` is a stub that accepts audio and returns `{ transcript: null }` today — designed to be wired to Whisper. The existing `ChatMessage` user type has no `transcript` field.

## Goals / Non-Goals

**Goals:**

- Fetch a transcript from `/api/transcribe` in the send flow.
- Update the user audio bubble with the transcript text once received.
- Include the transcript as a `transcript` field in the form data POSTed to `/api/speech/chat`.
- Render the transcript text below the audio player in the user bubble.
- Graceful degradation: transcript step failure must not break the send/reply loop.

**Non-Goals:**

- Replacing the audio player with text-only; the audio remains playable.
- Implementing real Whisper in this change (that's a backend concern for `/api/transcribe`).
- Replacing the existing backend API contract (`reply.text` from service) in any way.

## Decisions

### 1. Sequential: transcribe then send

**Choice:** In `sendAudio`, after adding the user audio bubble, call `POST /api/transcribe` first (non-blocking to UX since audio bubble is already shown), then when transcript comes back update the bubble text, then POST `/api/speech/chat` with both `audio` and `transcript`.

**Rationale:** The chat service receives the transcript alongside the audio in one request. Simple sequential async; no parallel complexity.

**Alternative:** Fire both requests in parallel — rejected because the transcript should ideally accompany the chat request, and parallel ordering is fragile.

### 2. Type: optional `transcript` on user audio message

**Choice:** Add `transcript?: string` to the `user / audio` variant of `ChatMessage`. Update bubble when transcription response arrives; if null/empty string, `transcript` stays undefined.

**Rationale:** Minimal type change; graceful when stub returns `null`.

### 3. Transcript shown beneath audio player

**Choice:** In `AudioMessageBubble`, if `message.transcript` is set, render it as a paragraph below the `<audio>` element, styled as readable text (`text-sm text-white/90`).

**Rationale:** Clean separation: audio for playback, text for readability.

### 4. Transcript forwarded to chat API route

**Choice:** `SpeechChatProvider` appends `transcript` to the `FormData` only if non-empty. The route reads `formData.get('transcript')` and includes it in the outbound form to the speech service.

**Rationale:** Service can use the text for NLP without re-transcribing; stays optional so empty transcript doesn't break the request.

### 5. Graceful degradation

**Choice:** If `/api/transcribe` fails or returns empty `transcript`, log and continue; user bubble has no transcript text, send proceeds normally.

**Rationale:** Transcription is an enhancement, not a blocker for the chat flow.

## Risks / Trade-offs

- **[Extra latency]** → Transcription request adds time before the chat send. Mitigated: chat POST only waits on transcription, not on assistant reply.
- **[Stub returns null]** → `transcript: null` from current stub is handled by the graceful degradation path; bubble shows no text until real Whisper is wired.

## Migration Plan

1. Extend `ChatMessage` type.
2. Update `sendAudio` to fetch transcript then send with transcript field.
3. Update `AudioMessageBubble` to render transcript text.
4. Update route to forward `transcript`.

## Open Questions

- None blocking.
