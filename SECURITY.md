# Security Policy

## Supported Versions

Phoenix Baileys V3 is currently in beta.

| Version | Supported |
|---|---|
| 3.0.0-beta.1 | Yes |
| Older Phoenix Baileys V3 versions | No |
| Phoenix Baileys V2 | No |

Only the latest Phoenix Baileys V3 release is considered supported for security fixes.

## Reporting a Vulnerability

Please do not publish sensitive vulnerability details in a public issue.

Preferred reporting method:

1. Open the GitHub repository for Phoenix Baileys V3.
2. Go to the repository Security section.
3. Use GitHub's private vulnerability reporting / security advisory feature when available.
4. Include enough information to reproduce and assess the issue.

A useful report should contain:

- affected Phoenix Baileys V3 version
- affected file or component
- reproduction steps
- expected behavior
- actual behavior
- security impact
- logs or proof of concept when appropriate

Do not include real WhatsApp session credentials, authentication state, private keys, tokens, passwords, or personal user data.

If private vulnerability reporting is not available, open a minimal public issue asking for a private contact channel without publishing exploit details.

## Scope

Security reports are especially relevant when they involve:

- authentication or session handling
- credential exposure
- unintended access to WhatsApp account state
- cryptographic or Signal protocol handling
- LID / PN identity mapping
- message integrity
- unsafe file or media handling
- remote code execution
- dependency vulnerabilities with a practical impact on Phoenix Baileys V3
- Phoenix-specific patches such as PHX-001 or PHX-002

## Out of Scope

The following are generally not considered Phoenix Baileys V3 security vulnerabilities by themselves:

- WhatsApp account bans or restrictions
- undocumented WhatsApp behavior changing
- upstream Baileys bugs that are not caused or worsened by a Phoenix-specific change
- theoretical dependency findings without a demonstrated impact
- social engineering
- exposed credentials that were committed or shared by an application using the library
- application-level vulnerabilities in projects that depend on Phoenix Baileys V3 but are unrelated to this library

Upstream issues should be reported to the upstream Baileys project when the problem exists unchanged in upstream Baileys.

## Phoenix-Specific Patches

Phoenix-specific changes are documented in:

```text
PHOENIX_PATCHES.md
```

When a security issue is caused by a Phoenix-specific patch, the affected patch ID should be included in the report when known.

Examples:

```text
PHX-001
PHX-002
```

## Disclosure

Please allow time for the issue to be investigated and fixed before publishing technical details.

When appropriate, a fix may include:

- a Phoenix Baileys V3 patch release
- regression tests
- an update to `PHOENIX_PATCHES.md`
- an update to `CHANGELOG.md`
- an upstream report when the issue also affects Baileys

## Secrets and Session Data

Never attach real WhatsApp session data to a security report.

This includes files such as:

```text
creds.json
session-*.json
pre-key-*.json
sender-key-*.json
identity-key-*.json
app-state-sync-*.json
tctoken-*.json
```

Always sanitize logs and reproduction data before sharing them.

## Upstream

Phoenix Baileys V3 is based on Baileys.

If a vulnerability is confirmed to exist in upstream Baileys without any Phoenix-specific cause, the issue should also be coordinated with the upstream maintainers where appropriate.
