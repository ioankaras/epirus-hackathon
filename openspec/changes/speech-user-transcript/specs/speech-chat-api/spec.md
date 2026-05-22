## MODIFIED Requirements

### Requirement: Chat endpoint accepts user audio

The application SHALL expose `POST /api/speech/chat` accepting `multipart/form-data` with an `audio` file field and an optional `transcript` text field, validating non-empty file and size limits consistent with existing transcribe constraints (max 25 MB, supported audio MIME types).

#### Scenario: Valid audio upload with transcript

- **WHEN** the client POSTs a non-empty supported audio file and a non-empty `transcript` field to `/api/speech/chat`
- **THEN** the server forwards both fields to the speech service and responds based on that service result

#### Scenario: Valid audio upload without transcript

- **WHEN** the client POSTs a valid audio file without a `transcript` field
- **THEN** the server forwards the audio to the speech service and responds normally

#### Scenario: Missing audio

- **WHEN** the client POSTs without an audio file
- **THEN** the server responds with HTTP 400 and `success: false`

## ADDED Requirements

### Requirement: Transcript forwarded to speech service

When a non-empty `transcript` field is present in the chat request, the route SHALL include it in the multipart form sent to the downstream speech service.

#### Scenario: Transcript included in downstream request

- **WHEN** the client sends audio with a non-empty `transcript` field
- **THEN** the downstream speech service receives both the `audio` file and the `transcript` text in the forwarded request
