# Phoenix Baileys V3

<p align="center">
  <strong>Phoenix-maintained WhatsApp Web library based on Baileys.</strong>
</p>

<p align="center">
  A modern Baileys distribution focused on targeted protocol fixes,
  clearer event semantics and stable integration with the Phoenix ecosystem.
</p>

---

> [!IMPORTANT]
> Phoenix Baileys V3 is based on the open-source
> [Baileys](https://github.com/WhiskeySockets/Baileys) project.
>
> It is not affiliated with, endorsed by, or officially connected to
> WhatsApp, Meta Platforms, Inc. or WhiskeySockets.

## Status

Phoenix Baileys V3 is currently under development.

Current development line:

```text
3.0.0-beta

The initial V3 release is being rebuilt from a current Baileys 7 codebase
instead of continuing the legacy Phoenix Baileys V2 fork.

The goal is to stay as close to upstream Baileys as possible while maintaining
a small number of documented Phoenix-specific improvements.

Why V3?

Phoenix Baileys V2 accumulated a large number of internal modifications over
time.

That made upstream updates increasingly difficult to integrate and maintain.

V3 follows a different approach:

Current Baileys
      +
small documented Phoenix patches
      =
Phoenix Baileys V3

Instead of modifying large parts of the protocol implementation, Phoenix V3
only changes behavior where there is a clear reason to do so.

Design Goals
Stay close to upstream Baileys
Keep Phoenix patches small and reviewable
Preserve modern LID / PN handling from upstream
Avoid unnecessary protocol modifications
Avoid AntiBan / masquerading systems
Add regression tests for Phoenix-specific behavior
Keep upgrades to future Baileys versions manageable
Document every Phoenix modification
Phoenix Patches

Phoenix-specific modifications are documented in:

PHOENIX_PATCHES.md

Each modification receives its own patch identifier.

Example:

PHX-001
PHX-002
PHX-003

This makes it possible to compare future Baileys releases against the exact
changes maintained by Phoenix.

Planned Initial Patch
PHX-001 - Group Leave / Remove distinction

Upstream Baileys currently emits both of these group events as:

action: 'remove'

even though WhatsApp itself distinguishes between:

GROUP_PARTICIPANT_LEAVE
GROUP_PARTICIPANT_REMOVE

Phoenix V3 intends to preserve that distinction:

GROUP_PARTICIPANT_LEAVE
-> action: "leave"

GROUP_PARTICIPANT_REMOVE
-> action: "remove"

This allows applications to reliably distinguish between:

a participant voluntarily leaving a group
a participant being removed by another user

without relying on additional heuristics.

This section describes the initial Phoenix V3 patch target while V3 is in
development. See PHOENIX_PATCHES.md for the implemented patch status.

Installation

Phoenix Baileys V3 is not yet considered stable.

Once published to npm:

npm install phoenix-baileys-v3

or:

yarn add phoenix-baileys-v3

During local development:

git clone https://github.com/Exiqonbotz/phoenix-baileys-v3.git
cd phoenix-baileys-v3
yarn
yarn build
Usage

Phoenix Baileys V3 keeps the familiar Baileys API.

import makeWASocket, {
  Browsers,
  DisconnectReason,
  useMultiFileAuthState
} from 'phoenix-baileys-v3'

Example:

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    auth: state,
    browser: Browsers.ubuntu('Phoenix')
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') {
      console.log('Phoenix Baileys connected')
    }
  })

  return sock
}

connect()
Group Events
sock.ev.on('group-participants.update', event => {
  console.log(event.id)
  console.log(event.participants)
  console.log(event.action)
})

Phoenix-specific event behavior will be documented in
PHOENIX_PATCHES.md.

Authentication

Multi-file authentication remains available:

import {
  useMultiFileAuthState
} from 'phoenix-baileys-v3'

const { state, saveCreds } =
  await useMultiFileAuthState('./auth')

const sock = makeWASocket({
  auth: state
})

sock.ev.on('creds.update', saveCreds)

For production applications, a database-backed auth state is recommended
instead of relying on a filesystem-based session store.

LID / PN Handling

Phoenix V3 uses the modern LID and phone-number mapping infrastructure provided
by the current Baileys codebase.

Legacy Phoenix V2 mapping implementations are not automatically carried into
V3.

Additional Phoenix-specific mapping logic will only be introduced if real-world
testing demonstrates that upstream behavior is insufficient.

What V3 Does Not Include

Phoenix V3 intentionally does not restore every feature from Phoenix Baileys V2.

In particular, the initial V3 line does not include:

legacy AntiBan wrappers
primary-device masquerading
the old Phoenix V2 store implementation
large protocol rewrites
legacy Rust bridge replacements
undocumented compatibility hacks

Old V2 functionality may be reconsidered individually when there is a real use
case.

Development

Install dependencies:

yarn

Build:

yarn build

Run tests:

yarn test

Lint:

yarn lint

Format:

yarn format
Upstream

Phoenix Baileys V3 is based on:

Baileys by WhiskeySockets

https://github.com/WhiskeySockets/Baileys

Baileys provides the underlying WhatsApp Web protocol implementation and the
majority of the library architecture.

Phoenix-specific modifications are maintained separately and documented so
that differences from upstream remain transparent.

Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any
way officially connected with WhatsApp, Meta Platforms, Inc., or any of their
subsidiaries or affiliates.

WhatsApp and related names, trademarks and logos belong to their respective
owners.

Users are responsible for how they use this software.

Do not use this project for spam, harassment, unauthorized bulk messaging,
stalkerware or other abusive activity.

Usage may also be subject to WhatsApp's Terms of Service.

License

Phoenix Baileys V3 is distributed under the MIT License.

The project is based on Baileys and retains the applicable upstream copyright
and license notices.

See:

LICENSE

for the complete license text.

Phoenix

Phoenix Baileys V3 is maintained as part of the Phoenix ecosystem.

Repository:

https://github.com/Exiqonbotz/phoenix-baileys-v3