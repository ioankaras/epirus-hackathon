## MODIFIED Requirements

### Requirement: User audio messages in thread

When the user finishes a recording, the application SHALL immediately append a user message bubble to the thread that contains the captured audio as the message input (playable in the UI), before the server responds. The bubble SHALL reflect sending, sent, or error state based on the upload result.

#### Scenario: Audio bubble on record complete

- **WHEN** the user stops a voice recording in the speech chat composer
- **THEN** a user-side audio message bubble appears in the thread with the recorded audio available to play

#### Scenario: Sending state during upload

- **WHEN** the audio message is being uploaded to the chat API
- **THEN** the user audio bubble shows a sending or pending indicator

#### Scenario: Sent after successful API

- **WHEN** the chat API returns a successful response for the uploaded audio
- **THEN** the user audio bubble shows a sent state (or clears the sending indicator)

### Requirement: Assistant text replies in thread

When the backend returns a reply for a sent message, the application SHALL append an assistant text bubble to the thread. The application SHALL NOT display assistant reply text that was not returned by the chat API response.

#### Scenario: Show assistant reply from server only

- **WHEN** the chat API returns a successful response with `reply.text`
- **THEN** an assistant message bubble with that text appears in the thread

#### Scenario: No client-generated assistant text

- **WHEN** the user sends a voice message
- **THEN** the client does not insert canned, stub, or locally generated assistant messages before the API response arrives

### Requirement: Wait for server response before assistant message

While the chat API request is in flight after a user audio message is sent, the UI SHALL indicate that the assistant response is pending and SHALL NOT show final assistant reply content until the request completes successfully.

#### Scenario: Pending assistant indicator

- **WHEN** the user audio bubble is in a sending state
- **THEN** the thread shows a pending or loading assistant indicator until the API responds or fails

#### Scenario: No assistant text on failure

- **WHEN** the chat API returns an error or network failure
- **THEN** no assistant text bubble with a successful reply is added and the user message shows an error state

## ADDED Requirements

### Requirement: Read-aloud only after server reply

Optional speech synthesis for assistant replies SHALL run only after assistant text is received from the chat API response, not before.

#### Scenario: TTS after response

- **WHEN** read-aloud is enabled and the chat API returns `reply.text`
- **THEN** speech synthesis uses that server-provided text
