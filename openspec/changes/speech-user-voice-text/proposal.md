## Why

When a user records and sends a voice message, their message appears in the chat as "Voice message" — a static placeholder — because the transcription stub at `/api/transcribe` always returns `null`. The conversation thread is unreadable without playing back each audio clip, making it impossible to follow the exchange at a glance.

## What Changes

- The `/api/transcribe` endpoint is wired to OpenAI Whisper so it returns a real transcription instead of `null`.
- The user's audio bubble in the chat displays the transcribed text immediately once the transcription resolves, replacing the "Voice message" placeholder.
- When transcription is unavailable or fails, the bubble continues to fall back to "Voice message" gracefully (no regression from current behaviour).

## Capabilities

### New Capabilities

- _(none — builds on existing `speech-chat-ui` and `speech-chat-api` capabilities)_

### Modified Capabilities

- `speech-chat-ui`: User audio bubble **must** show the transcribed text when available; the placeholder "Voice message" is only shown when no transcript is present.
- `speech-chat-api`: `/api/transcribe` **must** call OpenAI Whisper and return the transcript text; currently it is a stub that always returns `null`.

## Impact

- `app/app/api/transcribe/route.ts` — replace stub with real OpenAI Whisper call using `openai` SDK; requires `OPENAI_API_KEY` environment variable.
- `app/components/speech/SpeechChatModal.tsx` — `AudioMessageBubble` already renders `message.transcript`; no structural change needed, the fix is purely in the data layer.
- No changes to `SpeechChatProvider.tsx` or `types.ts` (transcript plumbing already implemented by `speech-user-transcript` change).
