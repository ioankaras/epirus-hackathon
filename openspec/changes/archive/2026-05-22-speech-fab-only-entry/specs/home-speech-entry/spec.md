## REMOVED Requirements

### Requirement: Featured AI Speech card on home

**Reason**: Speech entry is consolidated to the global microphone FAB; a duplicate home menu card is unnecessary.

**Migration**: Use the bottom-right speech FAB on any screen, including home, to open the AI speech chat modal.

### Requirement: Featured styling without animation

**Reason**: The featured home AI Speech card is removed; styling applied only to that card is no longer needed.

**Migration**: N/A — FAB styling is defined under `global-speech-fab`.

### Requirement: Parity with standard card interaction

**Reason**: No dedicated AI Speech home card remains.

**Migration**: FAB accessibility requirements apply under `global-speech-fab`.

## MODIFIED Requirements

### Requirement: Other home cards unchanged

All non-speech home action cards SHALL continue to use the default card appearance and behavior. The home screen SHALL NOT include a separate AI Speech Mode action card.

#### Scenario: Default cards on home

- **WHEN** the home screen lists primary banking actions
- **THEN** only balance, send, history, and bills cards are shown, each using the default card variant without featured gradient or AI badge styling

#### Scenario: No duplicate speech entry on home

- **WHEN** the user views the home screen
- **THEN** there is no AI Speech Mode card in the action list and speech is entered only via the global FAB
