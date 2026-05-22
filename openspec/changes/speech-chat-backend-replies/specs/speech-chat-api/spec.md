## REMOVED Requirements

### Requirement: Stub assistant reply in response

**Reason**: Assistant messages must come from the backend speech service, not canned stub text in the Next.js route.

**Migration**: Configure `SPEECH_SERVICE_URL` and implement the downstream service to return `reply.text`.

### Requirement: No real transcription in stub phase

**Reason**: Stub phase is removed; processing is delegated to the speech service.

**Migration**: Implement transcription/LLM logic in the speech service behind the proxy.

## MODIFIED Requirements

### Requirement: Chat endpoint accepts user audio

The application SHALL expose `POST /api/speech/chat` accepting `multipart/form-data` with an `audio` file field, validating non-empty file and size limits consistent with existing transcribe constraints (max 25 MB, supported audio MIME types).

#### Scenario: Valid audio upload

- **WHEN** the client POSTs a non-empty supported audio file to `/api/speech/chat`
- **THEN** the server forwards the audio to the configured speech service and responds based on that service result

#### Scenario: Missing audio

- **WHEN** the client POSTs without an audio file
- **THEN** the server responds with HTTP 400 and `success: false`

## ADDED Requirements

### Requirement: Service-backed assistant reply only

The chat endpoint SHALL obtain assistant reply text only from the configured backend speech service HTTP API, not from hardcoded or rotating placeholder strings in the application.

#### Scenario: Proxy to speech service

- **WHEN** `SPEECH_SERVICE_URL` is configured and a valid audio file is uploaded
- **THEN** the route forwards the request to the speech service and returns `success: true` with `reply.text` from the service response

#### Scenario: Service not configured

- **WHEN** `SPEECH_SERVICE_URL` is not set
- **THEN** the route responds with HTTP 503 and `success: false` with an error indicating the speech service is unavailable

#### Scenario: Service error

- **WHEN** the speech service returns an error or invalid payload
- **THEN** the route responds with an appropriate error status and `success: false` without inventing assistant reply text

### Requirement: Frontend uses chat API for send flow

The speech chat UI SHALL send user recordings to `/api/speech/chat` and SHALL wait for the HTTP response before rendering assistant reply content.

#### Scenario: FE awaits response

- **WHEN** the user sends a recording from the speech chat composer
- **THEN** the client awaits the `POST /api/speech/chat` response before adding assistant text to the thread
