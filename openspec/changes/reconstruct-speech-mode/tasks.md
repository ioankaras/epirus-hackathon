## 1. Speech chat provider and FAB

- [x] 1.1 Create `SpeechChatProvider` with `isOpen`, `open`, `close`, and `messages` state
- [x] 1.2 Create `SpeechFab` (gradient, mic icon, no `animate-*`) that calls `open()` on click
- [x] 1.3 Mount provider, FAB, and modal shell in `app/app/layout.tsx`; hide FAB when `isOpen`

## 2. Half-screen modal shell

- [x] 2.1 Create `SpeechChatModal` — bottom panel ~50vh, rounded top, backdrop scrim, `role="dialog"`, close button, Escape dismiss, focus trap
- [x] 2.2 Ensure underlying `<main>` page stays mounted and visible in top half when modal is open
- [x] 2.3 Verify no decorative `animate-*` on modal chrome

## 3. Speech chat API stub

- [x] 3.1 Add `POST /api/speech/chat` with audio validation (mirror transcribe limits)
- [x] 3.2 Return stub JSON: `{ success, messageId, reply: { text } }` with rotating placeholder replies

## 4. Chat UI inside modal

- [x] 4.1 Extract recording logic from `speech/page.tsx` into `useSpeechRecorder` hook
- [x] 4.2 Build modal chat: header (title, read-aloud toggle, close), scrollable message list, composer with tap-to-record
- [x] 4.3 User audio bubble with play + sending/error states; assistant text bubble on API success
- [x] 4.4 Wire send: record → stop → POST `/api/speech/chat` → append reply → optional `speechSynthesis`
- [x] 4.5 Update home featured AI Speech card to `open()` modal (no `/speech` navigation)
- [x] 4.6 Slim `/speech` route to open modal on mount or redirect home (backward-compatible deep link only)

## 5. Verification

- [x] 5.1 Manual: FAB on home, balance, send, history, bills; opens modal; page behind unchanged
- [x] 5.2 Manual: Close modal — same page, no route change; FAB returns
- [x] 5.3 Manual: Record → send → audio bubble → stub reply → second turn; read-aloud toggle
