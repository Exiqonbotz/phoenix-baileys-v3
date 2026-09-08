# Changelog

All notable Phoenix-specific changes to Phoenix Baileys V3 are documented in this file.

Phoenix Baileys V3 follows upstream Baileys closely. Upstream changes are not duplicated here unless they directly affect a Phoenix patch or release.

## 3.0.0-beta.1 - 2026-09-08

Initial Phoenix Baileys V3 beta release.

### Base

- Rebuilt on top of Baileys `7.0.0-rc14`
- Removed the large custom patch set from Phoenix Baileys V2
- Kept the upstream MIT license and attribution
- Introduced a documented Phoenix patch registry in `PHOENIX_PATCHES.md`

### Added

#### PHX-001 - Group Leave / Remove distinction

- Added `GroupParticipantEventAction`
- `GROUP_PARTICIPANT_LEAVE` now emits `action: 'leave'`
- `GROUP_PARTICIPANT_REMOVE` continues to emit `action: 'remove'`
- Added regression coverage for both event types

Affected files:

- `src/Types/Events.ts`
- `src/Utils/process-message.ts`
- `src/__tests__/Utils/phoenix-group-participants.test.ts`

#### PHX-002 - Interactive Native Flow Buttons

- Added high-level `interactiveButtons` message support
- Added `single_select` support
- Added `cta_url` support
- Added automatic serialization for object-based `buttonParamsJson`
- Added optional image and video headers
- Added support for `mentions`, `mentionAll`, and `contextInfo`
- Added the required Native Flow send node for interactive messages
- Added regression tests for button generation and mentions

Affected files:

- `src/Types/Message.ts`
- `src/Utils/messages.ts`
- `src/Socket/messages-send.ts`
- `src/__tests__/Utils/phoenix-interactive-buttons.test.ts`

### Verification

Build:

```text
npm run build
Success
```

Complete test suite:

```text
Test Suites: 30 passed, 30 total
Tests:       411 passed, 411 total
Snapshots:   0 total
```

PHX-002 was also verified against the live WhatsApp service using Phoenix bots.

### Deployment

Phoenix Baileys V3 was successfully installed and used by the Phoenix bot environment via:

```text
github:Exiqonbotz/phoenix-baileys-v3
```

The previous direct `baileys` dependency was removed from the Phoenix bot after successful live verification.
