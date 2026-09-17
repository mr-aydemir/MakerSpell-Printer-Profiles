# Snapmaker 2.0 (A250 / A350 / Artisan) network support - research note

Status: **draft / unverified**. This is a starting point for reverse-engineering
the Snapmaker 2.0 LAN protocol, not a usable control profile yet.

## Why it exists

Snapmaker U1 exposes Moonraker (`_snapmaker._tcp.local:7125`) and is fully
supported by the `snapmaker_moonraker` adapter and
`community/profiles/experimental-snapmaker-u1-v2.json`. The Snapmaker 2.0
family (A250, A350, Artisan) does **not** speak Moonraker. It uses Snapmaker's
own network layer, which is undocumented. A tester confirmed the LAN endpoint
is not Moonraker-compatible (`This is no Moonraker compatible machine`).

## What is known (unverified)

- Snapmaker's mobile app connects through a cloud/relay layer; LAN discovery
  historically used a UDP beacon and the panel/API on an HTTP port. The panel
  is usually reachable over the local network, but the control API surface is
  not public.
- The draft below assumes two candidate channels:
  - `api`: a WebSocket on port 8899 with a JSON command protocol (widely
    referenced by community projects, unconfirmed on 2.0 firmware).
  - `panel`: the device's HTTP panel on port 8080.

None of these paths or ports are confirmed against real 2.0 firmware, so
`community/drafts/snapmaker-2x0-v2.draft.json` intentionally ships with empty
`operations` and `verification.level: unverified`.

## How to make this real

1. Capture real traffic between the Snapmaker mobile app and a 2.0 printer on
   the same LAN (mitmproxy / tcpdump), or check community reverse-engineering
   projects for the current protocol.
2. Confirm the discovery service type and ports, then fill in the
   `discovery`, `channels`, `operations`, and `state` maps using the v2 schema
   (`community/schema/profile-v2.schema.json`).
3. Re-run `node scripts/validate.mjs` to keep the profile schema-valid.
4. A new custom protocol needs an approved transport adapter in the MakerSpell
   app before it can be shipped as a working profile (see
   [CONTRIBUTING.md](../CONTRIBUTING.md)).

## Tester contacts

The report that surfaced this came from a Snapmaker 2.0 owner via Reddit. Keep
the tester in the loop to confirm firmware-specific behavior.
