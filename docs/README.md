# MakerSpell printer profile documentation

This guide explains how MakerSpell's community-controlled printer support works.
Read it in order the first time; each page builds on the previous one.

## Learning path

1. [Architecture and mental model](01-architecture.md)
2. [Profile anatomy and printer matching](02-profile-anatomy.md)
3. [Permissions and security](03-permissions-and-security.md)
4. [Operations and delegation](04-operations.md)
5. [Interface controls](05-interface-controls.md)
6. [Print options](06-print-options.md)
7. [Testing and contributing](07-testing-and-contributing.md)
8. [Troubleshooting](08-troubleshooting.md)
9. [Building a declarative driver](09-declarative-driver.md)
10. [Full JSON printer driver v2 roadmap](10-full-json-driver-v2-roadmap.md)
11. [V2 channels and actions](11-v2-channels-and-actions.md)
12. [Built-in adapter migration matrix](12-built-in-adapter-migration.md)

## The shortest possible explanation

A community profile does three things:

1. identifies a printer;
2. describes a sandboxed printer-local protocol or selects a compiled fallback;
3. maps operations, status fields, permissions, and UI components.

It does **not** install executable code. Reviewed HTTP, WebSocket, MQTT,
FTP/FTPS, TCP console and G-code protocol primitives run through MakerSpell's
declarative runtime. The complete JSON-driven v2 design is documented in the
[v2 roadmap](10-full-json-driver-v2-roadmap.md).

Use [`built-in/registry-v1.json`](../built-in/registry-v1.json) to see what the
installed application already supports. Use a file under `community/profiles/`
to propose a safe, declarative override for a printer or firmware variant.

## Useful files

- [Community profile schema](../community/schema/profile.schema.json)
- [Full JSON v2 profile schema](../community/schema/profile-v2.schema.json)
- [Community-verified Creality Local v2 profile](../community/profiles/experimental-creality-local-v2.json)
- [Community-verified Snapmaker U1 v2 profile](../community/profiles/experimental-snapmaker-u1-v2.json)
- [Built-in adapter migration matrix](12-built-in-adapter-migration.md)
- [Example Klipper profile](../community/profiles/example-klipper.json)
- [Built-in adapter registry](../built-in/registry-v1.json)
- [Contribution rules](../CONTRIBUTING.md)

## In-app workflow

The MakerSpell editor has three views:

- **Form:** edit connection, authentication, operations, permissions, and
  interface controls without writing the complete JSON by hand.
- **JSON:** inspect or edit the complete manifest.
- **Preview:** check the responsive layout without sending commands.

`Validate & install` installs a local test copy. `Submit suggestion` sends the
proposal for review; it does not publish the profile immediately.

---

Next: [Architecture and mental model](01-architecture.md)
