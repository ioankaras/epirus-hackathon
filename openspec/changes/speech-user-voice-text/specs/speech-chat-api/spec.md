## REMOVED Requirements

### Requirement: No real transcription in stub phase
**Reason**: The stub phase is over. The transcription endpoint is now wired to OpenAI Whisper.
**Migration**: Replace the stub response body with a real Whisper call (see design.md). Retain the same JSON response shape (`transcript` field) so the client is unaffected.

## ADDED Requirements

### Requirement: Transcribe endpoint calls OpenAI Whisper

`POST /api/transcribe` SHALL send the received audio file to the OpenAI Whisper API (`whisper-1` model) and return the resulting text in the `transcript` field of the response.

#### Scenario: Successful transcription

- **WHEN** the client POSTs a non-empty, supported audio file to `/api/transcribe` and `OPENAI_API_KEY` is configured
- **THEN** the server responds HTTP 200 with `{ success: true, transcript: "<transcribed text>" }` where `transcript` is a non-empty string

#### Scenario: No API key configured

- **WHEN** `OPENAI_API_KEY` is not set and the client POSTs audio
- **THEN** the server responds HTTP 200 with `{ success: true, transcript: null }` so the caller degrades gracefully without an error

#### Scenario: Whisper returns empty or whitespace

- **WHEN** Whisper responds with an empty or whitespace-only string
- **THEN** the server returns `transcript: null` (treating it as no transcript)

#### Scenario: Whisper call fails

- **WHEN** the OpenAI API call throws an error (network, quota, etc.)
- **THEN** the server responds HTTP 200 with `{ success: true, transcript: null }` so the caller degrades gracefully
