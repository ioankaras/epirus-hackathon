# speech-chat-modal Specification

## Purpose
TBD - created by archiving change reconstruct-speech-mode. Update Purpose after archive.
## Requirements
### Requirement: Half-screen modal overlay

The speech chat SHALL be presented in a modal panel anchored to the bottom of the viewport occupying approximately half of the screen height (near 50vh / 50dvh).

#### Scenario: Modal size

- **WHEN** the speech chat modal is open
- **THEN** the chat panel covers roughly the bottom half of the viewport

### Requirement: Underlying page remains visible

While the modal is open, the application SHALL keep the current route and page content mounted; the user SHALL still see the top portion of the underlying page (optionally dimmed via a backdrop scrim).

#### Scenario: Page stays in place

- **WHEN** the user opens the speech chat modal from any main view
- **THEN** the URL and page content for that view remain unchanged and visible above the modal panel

### Requirement: Dismiss modal without navigation

The user SHALL be able to close the modal (close control, backdrop tap on scrim, or Escape) and return to the same underlying page without a route change.

#### Scenario: Close modal

- **WHEN** the user dismisses the speech chat modal
- **THEN** the modal closes and the underlying page is fully interactive again

### Requirement: Modal hosts chat UI

The modal SHALL contain the speech chat header, message thread, and voice composer—not a separate full-page route for the primary experience.

#### Scenario: Chat inside modal

- **WHEN** the modal is open
- **THEN** the user sees the chat thread and composer inside the bottom panel

### Requirement: No decorative animations on modal chrome

The modal shell SHALL NOT use decorative CSS animation utilities (`animate-*`, transition-based entrance effects) for opening or closing.

#### Scenario: Static modal presentation

- **WHEN** the modal opens or closes
- **THEN** the modal does not rely on decorative `animate-*` classes

### Requirement: Modal accessibility

The modal SHALL use `role="dialog"` and `aria-modal="true"`, include an accessible name, provide a visible close control, support Escape to dismiss, and trap keyboard focus within the modal panel while open.

#### Scenario: Dialog semantics

- **WHEN** the speech chat modal is open
- **THEN** assistive technologies expose it as a modal dialog with a labeled close action

