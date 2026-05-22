## Context

The app is a Next.js banking PWA with pages under `app/app/*` and a root layout that only wraps `{children}`. Speech today lives at `/speech` with `MediaRecorder`, upload to `/api/transcribe` (stub), and a non-chat UI. Users want the banking view to stay in place while a chat panel slides up over the bottom half of the screen.

## Goals / Non-Goals

**Goals:**

- FAB on every main view (home, balance, send, history, bills) **opens a modal**, not a new page.
- Modal occupies **~50% of viewport height** (bottom-anchored panel), top half shows the current page (optionally dimmed with a light scrim).
- Chat UI inside modal: audio user bubbles, text assistant bubbles, voice composer, multi-turn.
- Stub `POST /api/speech/chat` for send/reply loop.
- Optional `speechSynthesis` for assistant replies.
- Same modal openable from home “AI Speech Mode” featured card.

**Non-Goals:**

- Full-screen `/speech` as the primary UX (avoid duplicating chat in page + modal).
- Real Whisper / LLM on server.
- Slide/animate transitions (modal appears statically; no `animate-*` on FAB or chat chrome).
- Persisting chat across app restarts (in-memory in provider is fine for v1).

## Decisions

### 1. `SpeechChatProvider` + modal in root layout

**Choice:** Client provider in layout holds `{ isOpen, open, close, messages, ... }`. Renders `SpeechFab` + `SpeechChatModal` as siblings to `<main>`.

**Rationale:** FAB and modal share state; any page can call `open()` without routing.

### 2. Half-screen modal pattern

**Choice:** Fixed overlay: full-width panel `h-[50dvh] max-h-[50vh]` anchored to bottom, `rounded-t-3xl`, white/surface background, shadow. Backdrop `fixed inset-0` with `bg-black/30` on top half only or full-screen click-to-dismiss on scrim (top half). Underlying `<main>` content unchanged and not unmounted.

**Rationale:** Matches “half screen, rest stays the same” literally.

**Alternative:** Centered dialog — rejected; user asked for half-screen sheet.

### 3. FAB opens modal; hidden while modal open

**Choice:** FAB `onClick={() => open()}`. When `isOpen`, hide FAB or move behind modal z-index so it does not overlap composer.

**Rationale:** Avoid duplicate entry points while chatting.

### 4. No primary navigation to `/speech`

**Choice:** Remove `href="/speech"` from FAB. Home card uses `onClick` + `preventDefault` or button styled as card to `open()`. `/speech` page becomes redirect to `/` with `open()` on mount for old links, or minimal “opening chat…” then close.

**Rationale:** Single chat surface in modal.

### 5. Chat state in provider

**Choice:** `messages: ChatMessage[]` in context; modal is presentational + composer actions call context methods.

**Rationale:** Thread survives if user dismisses and reopens modal on same session (optional v1: clear on close — **default: keep messages until page refresh**).

### 6. API stub unchanged

**Choice:** `POST /api/speech/chat` returns `{ success, messageId, reply: { text } }`.

### 7. Recording UX

**Choice:** Tap-to-toggle record in modal composer footer; same MediaRecorder hook as before.

### 8. Accessibility

**Choice:** Modal `role="dialog"`, `aria-modal="true"`, focus trap in panel, Escape closes, close button in header.

## Risks / Trade-offs

- **[FAB vs modal z-index]** → FAB `z-40`, modal `z-50`, backdrop `z-45`.
- **[Focus trap vs page]** → Trap focus only inside bottom panel; top half inactive while open.
- **[iOS safe area]** → `pb-safe` on composer if needed.
- **[Home Card as link]** → Featured card may need `SpeechChatLink` wrapper instead of `href` to `/speech`.

## Migration Plan

1. Provider + modal shell + FAB in layout.
2. Stub API route.
3. Chat components inside modal; extract recording hook from `speech/page.tsx`.
4. Update home card; slim `/speech` redirect.
5. Manual test on all views.

## Open Questions

- Clear message history when modal closes? **Default: keep until refresh** for easier multi-turn testing.
