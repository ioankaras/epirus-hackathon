# speech-chat-api Specification

## Purpose
TBD - created by archiving change reconstruct-speech-mode. Update Purpose after archive.
## Requirements
### Requirement: Chat endpoint accepts user audio

The application SHALL expose `POST /api/speech/chat` accepting `multipart/form-data` with an `audio` file field, validating non-empty file and size limits consistent with existing transcribe constraints (max 25 MB, supported audio MIME types).

#### Scenario: Valid audio upload

- **WHEN** the client POSTs a non-empty supported audio file to `/api/speech/chat`
- **THEN** the server responds with HTTP 200 and `success: true`

#### Scenario: Missing audio

- **WHEN** the client POSTs without an audio file
- **THEN** the server responds with HTTP 400 and `success: false`

### Requirement: Stub assistant reply in response

Until real backend logic exists, the chat endpoint SHALL return a JSON body including an assistant reply text suitable for display in the chat UI.

#### Scenario: Stub reply shape

- **WHEN** a valid audio file is uploaded
- **THEN** the response includes `reply.text` as a non-empty string and a stable `messageId` identifier

### Requirement: Frontend uses chat API for send flow

The speech chat page SHALL send user recordings to `/api/speech/chat` (not only `/api/transcribe`) to obtain assistant replies for the thread.

#### Scenario: FE calls chat API

- **WHEN** the user sends a recording from the speech chat composer
- **THEN** the client POSTs the audio to `/api/speech/chat` and uses the JSON reply to render the assistant bubble

### Requirement: No real transcription in stub phase

The stub implementation SHALL NOT invoke external transcription or LLM services; it MAY return canned or metadata-based placeholder text.

#### Scenario: Stub-only processing

- **WHEN** audio is received by the stub handler
- **THEN** no external AI API is called and a placeholder assistant message is returned

