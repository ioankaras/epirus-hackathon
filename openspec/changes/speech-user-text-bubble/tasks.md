## 1. User bubble — text only

- [x] 1.1 In `AudioMessageBubble` (`SpeechChatModal.tsx`), remove the `<audio>` element and its wrapper
- [x] 1.2 Render `message.transcript` as the main text content; fall back to "Voice message" when absent

## 2. Verification

- [x] 2.1 Manual: Record → user bubble appears with "Voice message" (stub) or transcript text; no audio player visible
- [x] 2.2 Manual: Error state label still visible; assistant reply still arrives after API responds
