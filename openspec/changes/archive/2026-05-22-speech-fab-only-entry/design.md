## Context

Home (`app/app/page.tsx`) renders five action cards including a featured "AI Speech Mode" card with `onActivate={openSpeechChat}`. The layout already mounts `SpeechFab` via `SpeechChatShell` on every page including home. Users only need the FAB.

## Goals / Non-Goals

**Goals:**

- Home shows four standard banking cards only (balance, send, history, bills).
- Single speech entry: global FAB → modal.
- No regression to FAB visibility or modal behavior on home.

**Non-Goals:**

- Removing `SpeechFab`, modal, or `/speech` redirect route.
- Changing FAB styling or chat functionality.
- Removing archived spec files from `openspec/specs/` (delta handles requirement removal on sync).

## Decisions

### 1. Delete home card only; keep FAB

**Choice:** Remove the fifth `Card` from `page.tsx`; leave `SpeechChatShell` in layout unchanged.

**Rationale:** Minimal diff; FAB already satisfies `global-speech-fab` spec on home.

### 2. Clean up home page imports

**Choice:** Remove `useSpeechChat` import and hook usage from `page.tsx`.

**Rationale:** Avoid unused client dependency on speech context for home-only open.

### 3. Prune Card featured API if unused

**Choice:** After removing home card, grep for `variant="featured"`, `badge`, `onActivate`. If no usages remain, remove those props and featured styles from `Card.tsx` to reduce surface area.

**Rationale:** Featured card was the only consumer; keeps component simple.

**Alternative:** Leave Card props for future use — rejected unless another caller exists.

## Risks / Trade-offs

- **[Users who relied on home card]** → FAB is more discoverable on home (bottom-right); no functional loss.
- **[Bookmark `/speech`]** → Still works via redirect + modal open (unchanged).

## Migration Plan

1. Remove AI Speech card from home.
2. Optional Card cleanup.
3. Verify home shows 4 cards + FAB opens modal.

## Open Questions

- None.
