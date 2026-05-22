## 1. Types

- [x] 1.1 Add optional `transcript?: string` field to the `user / audio` variant of `ChatMessage` in `app/lib/speech/types.ts`

## 2. Provider send flow

- [x] 2.1 In `sendAudio`, after creating the audio blob URL and before POSTing to `/api/speech/chat`, call `POST /api/transcribe` with the audio
- [x] 2.2 If transcription succeeds and returns non-empty text, update the user message bubble in state with the transcript text
- [x] 2.3 If transcription fails or returns empty, continue without transcript (graceful degradation)
- [x] 2.4 Include `transcript` in the `FormData` sent to `/api/speech/chat` only when a non-empty transcript is available

## 3. Chat modal — audio bubble

- [x] 3.1 Render transcript text beneath the audio player in `AudioMessageBubble` when `message.transcript` is set

## 4. API route

- [x] 4.1 Read optional `transcript` field from incoming form data in `/api/speech/chat`
- [x] 4.2 Append `transcript` to the outbound `FormData` sent to the speech service when non-empty

## 5. Verification

- [x] 5.1 Manual: Record → audio bubble appears immediately → transcript text appears in bubble once received → assistant reply arrives after API responds
- [x] 5.2 Manual: With current stub (transcript returns null), bubble shows audio only and send still completes
