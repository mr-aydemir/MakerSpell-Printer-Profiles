# Snapmaker 2.0 (A250 / A350 / Artisan) network support - research note

Status: **draft / unverified**. The full LAN control protocol (SACP) is now
mapped from official sources; it still needs a confirmation pass on real 2.0
firmware before it becomes a shipped profile.

## The official protocol: SACP over TCP 8888

Snapmaker publishes SACP (Snapmaker)'s application-layer protocol as open
source at [Snapmaker/Snapmaker-SACP](https://github.com/Snapmaker/Snapmaker-SACP).
It is used by the official Luban and the SnapmakerCuraPlugin to talk to the
2.0, J1, Artisan, A150/A250/A350 and Ray machines. Transport is **TCP port
8888** by default.

The packet header is 13 bytes:

    AA 55 | length(2) | version=0x01 | receiverId(1) | crc8(2..5) | senderId(1) | attribute(1) | sequence(2) | commandSet(1) | commandId(1)

Peer IDs: 0 = software/Luban, 1 = controller, 2 = screen. Attribute: 0 =
request, 1 = ack. CRC8 covers bytes 0..5; a TCP/IP checksum covers the rest.

Discovery is a UDP broadcast of the text `discover`; the machine replies
`{Name}@{IP}|model:{model}|SACP:{version}`.

## Command sets (from SacpClient.ts / docs)

System (0x01):

| Cmd | Name |
|-----|------|
| 0x02 | Execute G-code |
| 0x05 | Connect(token) / 0x06 Disconnect |
| 0x20 | Get Module Info List |
| 0x21 | Get Machine Info (model, firmware, serial) |
| 0x33 | Coordinate movement |
| 0x35 | Home |
| 0x3b | Emergency stop info |
-|---
File transfer (0xb0):

| Cmd | Name |
|-----|------|
| 0x00 | Start transfer (zlib deflate, chunks) |
| 0x01 | Request/send chunk |
| 0x02 | Transfer result |
-|---
Print control (0xac):

| Cmd | Name | Payload |
|-----|------|---------|
| 0x03 | startPrint | GcodeFileInfo(md5, gcodeName, headType) |
| 0x04 | pausePrint | (empty) |
| 0x05 | resumePrint | (empty) |
| 0x06 | stopPrint | (empty) |
| 0x01 | print progress event |
| 0x02 | batch gcode |
| 0x00 | get gcode file |
| 0xa0 | subscribe print status |
| 0xa4 | subscribe work speed |
| 0xa5 | subscribe |
-|---
Temperature / toolheads:

| Set | Cmd | Name |
|-----|-----|------|
| 0x10 | 0x02 | Set nozzle (tool) temperature |
| 0x14 | 0x02 | Set bed temperature |
-|---

So the full 2.0 control surface is: connect, upload a compressed gcode file,
then start / pause / resume / stop it. Status and temperatures are available
via subscriptions.

## The 8080 HTTP surface (secondary)

Some community tooling also reaches the machine at port 8080 with
`/api/v1/connect`, `/api/v1/status?token=`, `/api/v1/upload?token=`. This
appears to be a higher-level bridge over the same device state. Print
control verbs are not confirmed there; SACP on 8888 is the authoritative
control path.

## How the draft maps this

[`community/drafts/snapmaker-2x0-v2.draft.json`](../community/drafts/snapmaker-2x0-v2.draft.json)
is a schema-v2 profile. The v2 JSON schema supports HTTP/WS/MQTT channels but
no raw binary TCP channel kind, so the SACP binary protocol cannot be expressed
through the current profile schema. The draft therefore keeps the HTTP surface
and documents SACP as the real control plane here.

A future SACP transport adapter in the MakerSpell app is required to ship a
working 2.0 profile (see [CONTRIBUTING.md](../CONTRIBUTING.md)).

## Validating the draft

    node scripts/validate.mjs

The draft lives in community/drafts/, outside the validation roots, so it
never blocks CI. To lint it against community/schema/profile-v2.schema.json,
copy it into community/profiles/ temporarily and run the validator.

## What is still missing

1. Confirm the connect(token) handshake and the exact transfer flow on a real
   2.0 firmware (SACP version 0x01).
2. Confirm the subscription payloads for print status so MakerSpell can show
   live progress and temperatures.
3. Implement and review a binary SACP transport adapter in MakerSpell.