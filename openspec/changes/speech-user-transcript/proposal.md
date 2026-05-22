## Why

The chat currently shows user voice messages as audio-only bubbles. The user's spoken words are never transcribed and shown as readable text, making the thread harder to read and requiring a player interaction to understand what was said. The backend service also receives only raw audio with no accompanying transcript, limiting its ability to process the request. Showing the transcription in the user bubble and including it in the request payload makes the conversation readable and richer for the backend.

## What Changes

- After recording stops and before or alongside the send call, the audio is transcribed to text via the existing `/api/transcribe` endpoint (Whisper stub today, real Whisper later).
- The user message bubble displays both the audio player **and** the transcribed text beneath it, so the conversation thread is readable without pressing play.
- The transcribed text is included in the `POST /api/speech/chat` request alongside the audio (`transcript` field in the form data) so the backend service can use it.
- If transcription fails or is empty, the flow degrades gracefully: audio bubble still shows, transcript field is omitted from the upstream request, assistant reply is still awaited.
- No new npm packages required; transcription reuses the existing `/api/transcribe` stub path.

## Capabilities

### New Capabilities

- _(none — builds on existing `speech-chat-ui` and `speech-chat-api` capabilities)_

### Modified Capabilities

- `speech-chat-ui`: User audio bubble includes transcribed text beneath the player when available.
- `speech-chat-api`: Request to downstream speech service MAY include `transcript` text field alongside the audio so the service can act on what was said.

## Impact

- `app/components/speech/SpeechChatProvider.tsx` — add transcription fetch step before/alongside the chat API call; thread bubble update with transcript text.
- `app/lib/speech/types.ts` — add optional `transcript` field to user audio message type.
- `app/components/speech/SpeechChatModal.tsx` — render transcript text in `AudioMessageBubble`.
- `app/app/api/speech/chat/route.ts` — forward `transcript` field (if present) to downstream service.
- No changes to `/api/transcribe` route itself.
