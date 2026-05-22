## Why

The home screen "AI Speech Mode" action uses the same `Card` treatment as routine banking tasks (balance, send money, bills). Voice is a differentiated, AI-powered entry point and should feel more premium and discoverable without adding motion, new dependencies, or extra interaction steps.

## What Changes

- Give the AI Speech entry on the home page a distinct visual treatment (gradient or accent surface, stronger typography, refined icon container) while keeping the same tap target, link, and `?autostart=mic` behavior.
- Extend or variant the shared `Card` component so the speech entry can opt into "featured" styling without duplicating markup on the home page.
- Preserve accessibility: contrast, focus ring, minimum touch size, and screen-reader labels unchanged in meaning.
- Explicitly exclude: CSS/JS animations, new routes, speech-page changes, and backend work.

## Capabilities

### New Capabilities

- `home-speech-entry`: Home-screen AI Speech action card appearance, hierarchy, and non-animated styling requirements.

### Modified Capabilities

- _(none — no existing OpenSpec specs in the repo)_

## Impact

- `app/app/page.tsx` — AI Speech `Card` usage (props or dedicated variant).
- `app/components/ui/Card.tsx` — optional `variant` / `featured` prop or thin wrapper for featured styling.
- No API, provider, or speech route changes.
