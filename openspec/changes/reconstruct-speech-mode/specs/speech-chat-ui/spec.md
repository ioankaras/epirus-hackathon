## ADDED Requirements

### Requirement: Chat layout inside speech modal

The speech chat modal SHALL present a chat-style interface with a scrollable message area and a bottom composer for voice input.

#### Scenario: Chat structure in modal

- **WHEN** the user opens the speech chat modal
- **THEN** they see a message thread region and a bottom input/composer area styled as a conversation view within the panel

### Requirement: User audio messages in thread

When the user finishes a recording and sends it, the application SHALL append a user message bubble to the thread that represents the sent audio (playable in the UI).

#### Scenario: Show sent audio bubble

- **WHEN** the user completes a recording and the send action succeeds
- **THEN** an audio message bubble appears on the user side of the thread with a way to play the recording

### Requirement: Assistant text replies in thread

When the backend returns a reply for a sent message, the application SHALL append an assistant text bubble to the thread.

#### Scenario: Show assistant reply

- **WHEN** the chat API returns a successful reply payload
- **THEN** an assistant message bubble with the reply text appears in the thread

### Requirement: Multi-turn conversation in modal

The user SHALL be able to record and send additional messages after receiving an assistant reply without closing the modal.

#### Scenario: Continue conversation

- **WHEN** an assistant reply is shown in the modal
- **THEN** the user can record and send another message and prior messages remain visible in order

### Requirement: Optional read-aloud of assistant replies

The application SHALL support optionally reading assistant text replies aloud using browser speech synthesis when the feature is enabled.

#### Scenario: Read aloud enabled

- **WHEN** read-aloud is enabled and a new assistant text reply is received
- **THEN** the application speaks the reply text using speech synthesis

#### Scenario: Read aloud disabled

- **WHEN** read-aloud is disabled and a new assistant reply is received
- **THEN** the reply is shown in the thread only with no speech synthesis

### Requirement: No decorative animations on chat UI

The speech chat UI inside the modal SHALL NOT use decorative CSS animations on bubbles or composer.

#### Scenario: Static chat chrome

- **WHEN** the speech chat modal is displayed
- **THEN** message bubbles and composer do not use decorative `animate-*` utilities

### Requirement: Sending and error states

While a message is uploading, the UI SHALL indicate a sending state on the user bubble; on failure, the UI SHALL indicate error and allow retry or a new recording.

#### Scenario: Sending indicator

- **WHEN** the user sends audio and the request is in flight
- **THEN** the user message shows a sending/pending state

#### Scenario: Send failure

- **WHEN** the chat API returns an error or network failure
- **THEN** the user message shows an error state and the user can attempt to send again
