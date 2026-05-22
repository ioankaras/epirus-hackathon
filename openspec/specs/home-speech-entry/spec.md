# home-speech-entry Specification

## Purpose
TBD - created by archiving change fancy-ai-speech-button. Update Purpose after archive.
## Requirements
### Requirement: Other home cards unchanged

All non-speech home action cards SHALL continue to use the default card appearance and behavior. The home screen SHALL NOT include a separate AI Speech Mode action card.

#### Scenario: Default cards on home

- **WHEN** the home screen lists primary banking actions
- **THEN** only balance, send, history, and bills cards are shown, each using the default card variant without featured gradient or AI badge styling

#### Scenario: No duplicate speech entry on home

- **WHEN** the user views the home screen
- **THEN** there is no AI Speech Mode card in the action list and speech is entered only via the global FAB

