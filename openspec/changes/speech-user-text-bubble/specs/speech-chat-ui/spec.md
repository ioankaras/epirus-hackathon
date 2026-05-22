## MODIFIED Requirements

### Requirement: User audio messages in thread

When the user finishes a recording, the application SHALL append a user message bubble displaying the transcribed text of the recording. If the transcript is not yet available or is empty, the bubble SHALL display a short fallback label. The bubble SHALL NOT include an audio player control.

#### Scenario: Transcript shown as message text

- **WHEN** transcription completes and the user message is in the thread
- **THEN** the user bubble displays the transcribed text as its primary readable content with no audio player

#### Scenario: Fallback when transcript unavailable

- **WHEN** the user message bubble is shown and no transcript is available
- **THEN** the bubble displays a short fallback label (e.g. "Voice message") instead of an empty bubble or an audio player

#### Scenario: No audio player in user bubble

- **WHEN** the speech chat thread is displayed
- **THEN** user message bubbles do not contain HTML audio player controls
