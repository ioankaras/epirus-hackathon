## MODIFIED Requirements

### Requirement: User audio messages in thread

When the user finishes a recording and sends it, the application SHALL append a user message bubble to the thread. The bubble SHALL display the transcribed text of the recording when a transcript is available. When no transcript is available, the bubble SHALL display a generic "Voice message" placeholder.

#### Scenario: Show sent audio bubble with transcript

- **WHEN** the user completes a recording, the send action is initiated, and transcription resolves with non-empty text
- **THEN** a user message bubble appears in the thread showing the transcribed text

#### Scenario: Show sent audio bubble without transcript

- **WHEN** the user completes a recording, the send action is initiated, and transcription returns null or fails
- **THEN** a user message bubble appears in the thread showing "Voice message" as a fallback label

#### Scenario: Transcript updates bubble after it appears

- **WHEN** the user bubble appears immediately with "Voice message" and transcription finishes shortly after
- **THEN** the bubble updates in place to show the transcript text without removing or re-adding the bubble
