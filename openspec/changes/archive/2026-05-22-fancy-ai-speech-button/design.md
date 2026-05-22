## Context

The home page (`app/app/page.tsx`) lists five actions via the shared `Card` component. Every card shares the same white surface, circular blue-tint icon well, and chevron—so AI Speech Mode does not stand out as an AI/voice feature. The speech page already uses a navy hero aesthetic; the home entry should echo that brand without copying the full speech UI.

Constraints from the request: no animations, no added complexity (no new components tree beyond a small `Card` variant), same link and autostart query.

## Goals / Non-Goals

**Goals:**

- Visually elevate the AI Speech `Card` using static Tailwind only (gradient background, inverted or high-contrast icon treatment, optional "AI" badge text).
- Keep one `Card` component with an opt-in `variant="featured"` (or `featured` boolean) so other home cards stay unchanged.
- Maintain `min-h-[72px]`, focus ring, and `href="/speech?autostart=mic"`.

**Non-Goals:**

- Animations (`animate-*`, transitions for decoration, Lottie, etc.).
- Changes to `/speech` page layout or microphone UI.
- New npm packages or icon libraries.
- Reordering or removing other home cards.

## Decisions

### 1. Extend `Card` with a `featured` variant instead of a separate component

**Choice:** Add optional `variant?: "default" | "featured"` to `Card.tsx`.

**Rationale:** Single link row pattern; home page only passes `variant="featured"` on the speech card. Avoids a second component file and duplicated accessibility markup.

**Alternative considered:** `FeaturedSpeechCard` wrapper — rejected as extra surface area for one call site.

### 2. Featured styling: navy gradient + white typography + solid icon disc

**Choice:** Featured card uses `bg-gradient-to-br from-primary-navy to-action-blue` (or similar tokens already in the app), white label/sublabel, icon in `bg-white/15` with white stroke icon, chevron `text-white/70`.

**Rationale:** Matches speech page navy panel; reads as "primary AI action" without motion. Pure utility classes.

**Alternative considered:** Gold/accent border only — weaker differentiation; still looks like a normal card.

### 3. Subtle "AI" affordance via text, not animation

**Choice:** Optional `badge` prop (e.g. `"AI"`) rendered as a small uppercase pill next to the label on featured variant only.

**Rationale:** Signals intelligence feature with zero animation and minimal DOM.

### 4. Icon: keep existing microphone SVG, slightly larger in featured well

**Choice:** `w-8 h-8` icon inside `w-14 h-14` featured disc (same outer size as default for alignment).

**Rationale:** No new assets; slightly bolder glyph in a high-contrast well.

## Risks / Trade-offs

- **[Contrast on gradient]** → Use existing `primary-navy` / `action-blue` pair and white text; verify sublabel at `text-white/80` meets readability.
- **[Featured variant misuse]** → Only document/use on home speech card; TypeScript union discourages arbitrary values.
- **[Visual inconsistency with other cards]** → Intentional; speech is the only featured card on home for now.

## Migration Plan

1. Implement `Card` variant + props.
2. Update home page speech `Card` with `variant="featured"` and optional badge.
3. Manual check: home list alignment, focus state, tap navigates to speech with autostart.

Rollback: revert `Card` props and home page to previous markup.

## Open Questions

- None blocking. Badge copy fixed to "AI" unless product prefers "Voice" later (cosmetic only).
