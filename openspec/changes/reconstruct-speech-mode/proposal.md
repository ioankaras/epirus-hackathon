## Why

The current speech screen is a standalone “voice assistant” panel with waveform visuals and upload status text, not a conversational flow. Users need persistent access to AI speech from any banking screen and a chat-like experience where they send voice messages, see assistant replies, and continue the thread—without leaving the screen they were on.

## What Changes

- Add a global AI speech floating action button (FAB) fixed bottom-right on the home page and all main app views, styled distinctly but without animations.
- **Open a half-screen speech chat modal** when the FAB (or home AI Speech card) is activated—the underlying page remains visible in the top half (dimmed backdrop optional); **no route change** required for the primary flow.
- Modal content: scrollable message thread, user audio message bubbles, assistant text bubbles, and a bottom composer for voice capture.
- Show each user recording in the thread after it is “sent” to the backend (stubbed for now); show assistant messages when the backend responds (mock/stub until real BE).
- Support multi-turn conversation inside the modal; dismiss modal to return to the same page state.
- Optional assistant read-aloud of text replies via browser speech synthesis (toggle in modal header).
- Introduce a frontend–backend contract for speech chat (`POST` user audio, `response` with assistant text); implement route stub only—no Whisper/sanitization yet.
- Deprecate the full-page `/speech` hero UI for this flow (route may redirect or open modal for bookmark compatibility).

## Capabilities

### New Capabilities

- `global-speech-fab`: Persistent entry control on main views; opens the speech chat modal (does not navigate away).
- `speech-chat-modal`: Half-screen overlay modal hosting the chat UI; underlying page stays mounted and visible.
- `speech-chat-ui`: Chat thread, audio bubbles, assistant bubbles, recording controls, conversation continuity inside the modal.
- `speech-chat-api`: API shape and stub handler for sending audio and returning assistant messages.

### Modified Capabilities

- _(none — no archived specs in `openspec/specs/` yet)_

## Impact

- `app/app/layout.tsx` — mount `SpeechFab` + `SpeechChatModal` with shared client provider for open state and message list.
- New components under `app/components/speech/` (FAB, modal shell, message list, bubbles, composer).
- `app/app/api/speech/chat/route.ts` (stub).
- `app/app/page.tsx` — home featured card opens modal instead of linking to `/speech` (optional keep `/speech` as deep link).
- `app/app/speech/page.tsx` — simplify to redirect or thin wrapper that opens modal (no full-page chat duplicate).
