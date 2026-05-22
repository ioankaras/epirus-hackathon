## MODIFIED Requirements

### Requirement: User audio messages in thread

When the user finishes a recording, the application SHALL immediately append a user message bubble containing both the audio player and, when available, the transcribed text of the recording. The bubble SHALL reflect sending, sent, or error state based on the upload result.

#### Scenario: Audio bubble on record complete

- **WHEN** the user stops a voice recording in the speech chat composer
- **THEN** a user-side audio message bubble appears in the thread with the recorded audio available to play

#### Scenario: Transcript displayed in user bubble

- **WHEN** the transcription of the recording is received from the transcribe endpoint
- **THEN** the transcribed text is shown beneath the audio player within the user message bubble

#### Scenario: No transcript text when transcription is unavailable

- **WHEN** the transcription request fails or returns an empty result
- **THEN** the user audio bubble shows only the audio player without transcript text and the send flow continues normally

#### Scenario: Sending state during upload

- **WHEN** the audio message is being uploaded to the chat API
- **THEN** the user audio bubble shows a sending or pending indicator
