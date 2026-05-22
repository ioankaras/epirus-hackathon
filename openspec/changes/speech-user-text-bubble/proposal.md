## Why

The user message bubble currently shows an audio player control with the transcript text beneath it. Having an audio player in the chat makes the conversation feel like a file attachment rather than a natural chat. Since the recording is already transcribed to text, the user bubble should display only that text—matching the style and feel of the assistant text bubble and making the thread fully readable at a glance.

## What Changes

- Replace the audio player in the user message bubble with a plain text display using the transcript.
- While transcription is still in flight (or if the transcript is empty), show a concise fallback label ("Voice message") so the bubble appears immediately and never looks empty.
- Remove the `<audio>` element and its wrapper entirely from the user bubble.
- Keep the send/error status indicator as is.
- No changes to recording, transcription, or API logic—this is purely a UI rendering change.

## Capabilities

### New Capabilities

- _(none)_

### Modified Capabilities

- `speech-chat-ui`: User message bubble displays transcript text only (no audio player); fallback label when transcript is unavailable.

## Impact

- `app/components/speech/SpeechChatModal.tsx` — rewrite `AudioMessageBubble` to render text instead of `<audio>`.
- No changes to types, provider, or API routes.
