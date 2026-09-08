# Phoenix Baileys V3 Patch Registry

This document tracks all Phoenix-specific changes made on top of upstream Baileys.

The goal is to keep Phoenix Baileys V3 as close to upstream as possible.

Every Phoenix-specific modification must:

- have a unique patch ID
- explain why the change exists
- list the affected files
- include tests where practical
- be reviewed again when upstream Baileys is updated

---

## Patch Status

| ID | Name | Status |
|---|---|---|
| PHX-001 | Group Leave / Remove distinction | Implemented |
| PHX-002 | Interactive Native Flow Buttons | Implemented |

---

# PHX-001 - Group Leave / Remove distinction

## Status

Implemented in `3.0.0-beta.1`.

## Problem

Upstream Baileys distinguishes internally between the WhatsApp message stub types:

```text
GROUP_PARTICIPANT_LEAVE
GROUP_PARTICIPANT_REMOVE

but currently emits both through:

group-participants.update

with:

action: 'remove'

This removes useful information from the event.

Applications then have to guess whether:

a participant voluntarily left the group
a participant was removed by another participant

Phoenix previously had to use additional heuristics to determine this.

Phoenix Behavior

Phoenix Baileys V3 preserves the original distinction.

GROUP_PARTICIPANT_LEAVE
-> action: "leave"

GROUP_PARTICIPANT_REMOVE
-> action: "remove"
Expected Event Examples

Voluntary leave:

{
  id: '1203...@g.us',
  participants: [...],
  action: 'leave',
  author: ...
}

Participant removed:

{
  id: '1203...@g.us',
  participants: [...],
  action: 'remove',
  author: ...
}
Design

leave is intended as an incoming event action.

It should not automatically become a valid outgoing action for APIs such as:

groupParticipantsUpdate(
  groupId,
  participants,
  action
)

The outgoing participant action API should continue using actions such as:

add
remove
promote
demote

Phoenix therefore uses a separate event action type:

type GroupParticipantEventAction =
  ParticipantAction | 'leave'

This keeps incoming event semantics separate from outgoing participant actions.

Files

PHX-001 modifies:

src/Types/Events.ts
src/Utils/process-message.ts
src/__tests__/Utils/phoenix-group-participants.test.ts
Tests

Dedicated PHX-001 regression tests verify:

GROUP_PARTICIPANT_LEAVE
-> group-participants.update.action === "leave"

and:

GROUP_PARTICIPANT_REMOVE
-> group-participants.update.action === "remove"

The complete test suite was also executed after implementation.

Result:

Test Suites: 29 passed, 29 total
Tests:       409 passed, 409 total
Snapshots:   0 total

The project build also completed successfully.

Upstream Compatibility

This patch should remain as small as possible.

When updating the upstream Baileys base, check whether Baileys itself has introduced equivalent behavior.

If upstream later distinguishes Leave and Remove natively, PHX-001 should be removed instead of maintaining duplicate logic.

PHX-002 - Interactive Native Flow Buttons
Status

Implemented in 3.0.0-beta.1.

Problem

Upstream Baileys does not expose a simple high-level interactiveButtons message API for the Native Flow buttons used by the Phoenix menu.

Phoenix Baileys V2 previously included custom functionality for these messages.

Without this functionality, applications would have to manually build the WhatsApp InteractiveMessage protobuf structure and the required Native Flow send node.

Phoenix Behavior

Phoenix Baileys V3 adds a high-level:

interactiveButtons

message property.

Example:

await sock.sendMessage(jid, {
  text: 'Phoenix Menu',
  footer: 'Vivere diu Phoenix',
  interactiveButtons: [
    {
      name: 'single_select',
      buttonParamsJson: {
        title: 'Select menu',
        sections: [
          {
            title: 'Phoenix',
            rows: [
              {
                header: 'Menu',
                title: 'Main Menu',
                id: '/menu'
              }
            ]
          }
        ]
      }
    },
    {
      name: 'cta_url',
      buttonParamsJson: {
        display_text: 'Phoenix Website',
        url: 'https://phoenixgermany.com',
        merchant_url: 'https://phoenixgermany.com'
      }
    }
  ]
})

buttonParamsJson accepts either:

string

or:

Record<string, unknown>

Objects are automatically serialized to JSON before the Native Flow message is generated.

Supported Initial Button Types

PHX-002 is initially designed around the Native Flow button types required by Phoenix.

Tested:

single_select
cta_url

The interface remains generic, so additional Native Flow button names may work, but they are not considered officially supported until regression coverage is added.

Media

Interactive messages can optionally include:

image
video

Media is attached to the InteractiveMessage header through the existing Baileys media upload pipeline.

Mentions and Context

Interactive messages support:

mentions
mentionAll
contextInfo

This allows Phoenix menu messages to retain mentions and additional context information.

Native Flow Send Node

When interactiveButtons are present, Phoenix Baileys V3 adds the Native Flow send node required for the interactive message.

Structure:

biz
└── interactive
    └── native_flow

The relevant node identifies the outgoing message as:

type: native_flow
v: 1

with:

native_flow
v: 9
name: mixed

This behavior is only applied to messages containing interactiveButtons.

Ordinary message sending remains unchanged.

Files

PHX-002 modifies:

src/Types/Message.ts
src/Utils/messages.ts
src/Socket/messages-send.ts
src/__tests__/Utils/phoenix-interactive-buttons.test.ts
Tests

Dedicated PHX-002 regression tests verify:

single_select generation
cta_url generation
buttonParamsJson serialization
interactive message body
interactive message footer
mentions inside contextInfo

Dedicated PHX-002 test result:

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total

After PHX-002 was implemented, the complete project test suite was executed again.

Result:

Test Suites: 30 passed, 30 total
Tests:       411 passed, 411 total
Snapshots:   0 total

The project build also completed successfully.

Upstream Compatibility

PHX-002 should remain isolated from the normal Baileys message generation path.

When updating the upstream Baileys base, check whether upstream Baileys has introduced an equivalent high-level Native Flow button API.

If upstream later provides equivalent functionality, PHX-002 should be reviewed and reduced or removed where possible.

Patch Template

Future Phoenix patches should use this structure:
# PHX-XXX - Patch name

## Status

Planned / Implemented / Removed

## Problem

What problem does this solve?

## Phoenix Behavior

What does Phoenix change?

## Files

Which files are modified?

## Tests

How is the behavior verified?

## Upstream Compatibility

What needs to be checked during future Baileys upgrades?