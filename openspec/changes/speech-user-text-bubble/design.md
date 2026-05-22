## Context

`AudioMessageBubble` in `SpeechChatModal.tsx` currently renders: a small "Voice message" label, an `<audio controls>` element, the transcript text below the player, and a status label. The `ChatMessage` user type already has `transcript?: string`. The goal is to drop the audio player and show the transcript as the primary content.

## Goals / Non-Goals

**Goals:**

- User bubble shows transcript text as the main readable content.
- While transcript is absent (sending state, stub returns null), display a short fallback string ("Voice message" or "…").
- Preserve sending/error status label.
- Bubble style stays consistent: right-aligned, navy background, white text.

**Non-Goals:**

- Changing the recording, transcription, or API flows.
- Adding any audio playback affordance (user explicitly asked for text format).
- Changing the assistant bubble.

## Decisions

### 1. Fallback when no transcript

**Choice:** If `message.transcript` is falsy, render a muted italic label "Voice message" as placeholder text so the bubble is never empty.

**Rationale:** The bubble appears before transcription completes; needs something visible. Once transcript arrives via state update, it replaces the placeholder.

### 2. Rename component

**Choice:** Keep the component named `AudioMessageBubble` to avoid renaming throughout the tree (it is only used internally in the modal file).

**Alternative:** Rename to `UserMessageBubble` — deferred; cosmetic only.

## Risks / Trade-offs

- **[No playback]** → User cannot replay the recording from the chat. This is intentional per the request.
- **[Stub returns null]** → "Voice message" placeholder shows permanently until real Whisper is wired. Acceptable for now.

## Migration Plan

1. Edit `AudioMessageBubble` in `SpeechChatModal.tsx`: remove `<audio>`, render `message.transcript ?? "Voice message"`.
2. Build and verify.

## Open Questions

- None.
