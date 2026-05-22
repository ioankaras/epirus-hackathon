## ADDED Requirements

### Requirement: Featured AI Speech card on home

The home screen SHALL render the "AI Speech Mode" action as a visually distinct featured card that remains a single link with the same destination and autostart query as today.

#### Scenario: Navigate to speech with autostart

- **WHEN** the user activates the AI Speech card on the home screen
- **THEN** the app navigates to `/speech?autostart=mic`

### Requirement: Featured styling without animation

The featured AI Speech card SHALL use static visual styling only (for example gradient background, high-contrast typography, and accent icon container) and SHALL NOT use CSS animation classes or decorative transition effects for this change.

#### Scenario: No motion on featured card

- **WHEN** the home screen is displayed
- **THEN** the AI Speech card does not apply `animate-*` or animation-oriented transition utilities for decorative effect

### Requirement: Parity with standard card interaction

The featured AI Speech card SHALL preserve a minimum touch target consistent with other home action cards, a visible focus indicator, and the same label and sublabel semantics for assistive technologies.

#### Scenario: Keyboard focus

- **WHEN** the user moves keyboard focus to the AI Speech card
- **THEN** a focus ring is visible and activation follows the same link behavior as other home cards

### Requirement: Other home cards unchanged

All non-speech home action cards SHALL continue to use the default card appearance and behavior.

#### Scenario: Default cards on home

- **WHEN** the home screen lists balance, send, history, and bills actions
- **THEN** each uses the default card variant without featured gradient or AI badge styling
