## 1. Types and provider send flow

- [x] 1.1 Extend `ChatMessage` (or thread state) with `assistant` loading/pending type for in-flight requests
- [x] 1.2 Update `sendAudio`: show user audio bubble immediately on send; add loading assistant row; append assistant text only on API success; remove any local reply generation
- [x] 1.3 Run read-aloud only after `reply.text` is received from the API

## 2. Chat modal UI

- [x] 2.1 Ensure audio bubble displays captured recording as input with play control and sending/sent/error labels
- [x] 2.2 Render pending/loading assistant indicator while awaiting API response; hide when reply arrives or on error
- [x] 2.3 Optionally disable record button while a request is in flight

## 3. API route — service proxy, no stubs

- [x] 3.1 Remove `STUB_REPLIES` and rotating placeholder logic from `/api/speech/chat`
- [x] 3.2 Implement proxy to `SPEECH_SERVICE_URL` (forward audio multipart, map service JSON to `{ success, messageId, reply }`)
- [x] 3.3 Return 503 when `SPEECH_SERVICE_URL` is unset; pass through service errors without inventing `reply.text`
- [x] 3.4 Document env var in `.env.example` (or README) with expected service response shape

## 4. Verification

- [x] 4.1 Manual: Record → audio bubble appears → loading shown → assistant text only after mock/service responds
- [x] 4.2 Manual: With no `SPEECH_SERVICE_URL`, send shows error on user bubble and no fake assistant message
- [x] 4.3 Manual: Multi-turn still works; read-aloud uses server text only
