# global-speech-fab Specification

## Purpose
TBD - created by archiving change reconstruct-speech-mode. Update Purpose after archive.
## Requirements
### Requirement: Speech FAB visible on main app views

The application SHALL display an AI speech floating action button fixed to the bottom-right on the home page and on each primary banking view (balance, send, history, bills).

#### Scenario: FAB on home

- **WHEN** the user views the home page
- **THEN** the speech FAB is visible in the bottom-right corner

#### Scenario: FAB on secondary views

- **WHEN** the user views balance, send, history, or bills
- **THEN** the speech FAB is visible in the bottom-right corner

### Requirement: FAB opens speech chat modal

The speech FAB SHALL open the half-screen speech chat modal when activated and SHALL NOT navigate to a different route as the primary behavior.

#### Scenario: Open modal from FAB

- **WHEN** the user activates the speech FAB
- **THEN** the speech chat modal opens and the current page remains visible behind it

### Requirement: FAB hidden while modal is open

The speech FAB SHALL NOT be shown while the speech chat modal is open, to avoid overlapping the modal composer.

#### Scenario: FAB hidden when chatting

- **WHEN** the speech chat modal is open
- **THEN** the global speech FAB is not rendered

### Requirement: FAB styling without animation

The speech FAB SHALL use static visual styling (gradient, shadow, icon) and SHALL NOT use CSS animation utilities for decorative effect.

#### Scenario: Static FAB appearance

- **WHEN** any page with the FAB is displayed
- **THEN** the FAB does not use `animate-*` classes

### Requirement: FAB accessibility

The speech FAB SHALL expose an accessible name (e.g. aria-label “Open AI speech chat”), meet minimum touch target size (at least 44×44 CSS pixels), and show a visible focus indicator.

#### Scenario: Keyboard activation

- **WHEN** the FAB receives keyboard focus and the user activates it
- **THEN** the speech chat modal opens with focus styles visible on the FAB before it hides

