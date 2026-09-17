# Snapmaker 2.0 (A250 / A350 / Artisan) network support - research note

Status: **draft / unverified**. A working start point for Snapmaker 2.0 LAN
support, but not a fully audited control profile yet.

## What was verified (community reverse-engineering)

Multiple independent community projects describe the same Snapmaker 2.0 LAN
surface. The draft profile reflects these; the endpoint details still need a
confirm on real 2.0 firmware.

- **UDP discovery**: a broadcast `discover` message to port `20054` makes the
  printer answer with
  `Snapmaker@<ip>|model:Snapmaker 2 Model A350|status:IDLE`.
  Source: NiteCrwlr/playground SNStatus.py, steffr.ch.
- **HTTP API on port 8080**:
  - `POST /api/v1/connect` - requests a pairing token (approved on the
    printer touchscreen the first time).
  - `GET /api/v1/status?token=<T>` - state, nozzle/bed temperatures, position,
    job filename, progress, elapsed/remaining time, work speed, enclosure
    state. Source: NiteCrwlr/playground SNStatusV2.py.
  - `GET /api/v1/enclosure?token=<T>` - enclosure door/led/fan state.
- **Authentication**: once a token is approved on the touchscreen it stays
  valid, so later connects do not need a new confirmation.
  Source: Home Assistant community forum.

## How the draft maps this

[`community/drafts/snapmaker-2x0-v2.draft.json`](../community/drafts/snapmaker-2x0-v2.draft.json)
is a schema-v2 profile with HTTP status read support (status, connect,
enclosure) and thermal/position state mappings, marked `unverified`. It
deliberately does **not** list print start, file upload or camera, because
those endpoints are not confirmed for 2.0 firmware.

The UDP discovery is real but the v2 JSON profile schema has no UDP channel
kind today, so it is documented here rather than expressed in the draft.

## Validating the draft

```
node scripts/validate.mjs
```

The draft lives in `community/drafts/`, which is not part of the validation
roots, so it never blocks CI. To lint it against the schema
`community/schema/profile-v2.schema.json`, copy it into
`community/profiles/` temporarily and run the validator.

## What is still missing to make it a real control profile

1. Confirm the pairing flow and the full status schema on real 2.0 firmware
   (capture traffic from the Snapmaker mobile app, or use a tester with the
   device on hand).
2. Reverse-engineer print start, file upload and camera for 2.0; several of
   these are likely TCP/WebSocket commands that do not fit the current HTTP
   operations yet.
3. A custom transport adapter in the MakerSpell app is required for any
   custom protocol before a profile can ship (see
   [CONTRIBUTING.md](../CONTRIBUTING.md)).
