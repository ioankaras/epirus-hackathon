## Why

AI speech is now available globally via the bottom-right microphone FAB and half-screen chat modal. The home screen still shows a separate featured "AI Speech Mode" card, which duplicates entry, adds clutter, and confuses the primary interaction model.

## What Changes

- Remove the featured AI Speech `Card` from the home page action list.
- Remove `useSpeechChat` / `onActivate` wiring from home that exists only for that card.
- Keep the global `SpeechFab` as the sole entry point to open the speech chat modal (on home and all other main views).
- Optionally simplify `Card` component if `variant="featured"`, `badge`, and `onActivate` are no longer used anywhere (remove dead props if unused after home card removal).

## Capabilities

### New Capabilities

- _(none)_

### Modified Capabilities

- `home-speech-entry`: Remove requirements for the featured home AI Speech card; speech entry is FAB-only.

### Unchanged (by reference)

- `global-speech-fab`, `speech-chat-modal`, `speech-chat-ui`, `speech-chat-api` — no requirement changes.

## Impact

- `app/app/page.tsx` — delete AI Speech card block and speech chat imports used only there.
- `app/components/ui/Card.tsx` — optional cleanup of featured variant props if unused.
- `/speech` deep-link route may remain for backward compatibility (unchanged in this change).
