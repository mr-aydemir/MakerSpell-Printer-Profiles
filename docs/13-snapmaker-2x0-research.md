# Snapmaker 2.0 network support - research note

Status: draft / unverified. Working start point for Snapmaker 2.0 LAN, not a fully audited control profile yet.

## What was verified (community reverse-engineering)

- UDP discovery: broadcast `discover` on port 20054, reply `Snapmaker@<ip>|model:Snapmaker 2 Model A350|status:IDLE` (NiteCrwlr/playground, steffr.ch).
- HTTP API on port 8080: `POST /api/v1/connect` (pairing token), `GET /api/v1/status?token=` (state, nozzle/bed temps, position, progress, enclosure), `GET /api/v1/enclosure?token=` (door/led/fan).
- Auth: a token approved once on the touchscreen stays valid (Home Assistant forum).


## File upload and the 8080 command surface (confirmed)

A community upload script (zvalentine22 gist) confirms the 8080 API is not
read-only. Endpoints:

- `POST /api/v1/connect` - returns a JSON token.
- `GET /api/v1/status?token=` - returns 200 when ready, 204 while busy/not
  yet authorized (the client polls until 200 before uploading).
- `POST /api/v1/upload?token=` with multipart field `file` - uploads a
  .gcode file.

So the LAN surface is **connect / status / upload** at minimum. This matches
Luban's "Transfer via Wi-Fi" flow (the official slicer UI) and the Snapmaker
forum request "File Transfer via WiFi". Print start/pause/resume/stop verbs
are still not confirmed on this HTTP surface; the SSTP SYS_CTRL op-codes
remain the low-level path.

The draft profile now exposes `uploadFile` (fileUpload) alongside status
reads.

## Vendor firmware and the SSTP binary protocol

Snapmaker/Snapmaker2-Controller is Marlin-based 2.0 firmware. It exposes the low-level control plane over a binary protocol, SSTP (snapmaker/src/common/protocol_sstp.*).

SSTP PDU framing (big-endian):

    AA 55  SOF (2)
    data_len  (2)
    version   (1)
    len_chk   (1)
    checksum  (2)
    event_id  (2)
    op_code   (1)
    data[]

Event ids (from event_handler.h): 1 GCODE_REQ, 2 GCODE_ACK, 3/4 FILE_GCODE_REQ/ACK, 5/6 FILE_OP_REQ/ACK, 7 SYS_CTRL_REQ, 8 SYS_CTRL_ACK, 9 SETTING_REQ, 0xA SETTING_ACK, 0x13/0x14 FILE_GCODE_PACK_REQ/ACK.

SYS_CTRL op-codes (event_id 7): 1 GET_STATUSES, 2 GET_EXCEPTION, 3 START_WORK, 4 PAUSE, 5 RESUME, 6 STOP, 7 FINISH, 8 GET_LAST_LINE, 0x14 GET_FILAMENT_STATE, 0x15 GET_HOTEND_TEMP.

Status payload (SystemStatus_t, system.cpp): x,y,z,e as int32*1000 each; bed/hotend current+target temps as int16 each; feedrate int16; laser_power and cnc_rpm uint32; system_state uint8 (0 idle, 3 working, 4 paused); addon_state uint8; executor_type uint8.

The firmware status byte maps idle 0, working 3, paused 4. This is the binary path the touchscreen uses; the 8080 /api/v1 JSON is a higher-level bridge over the same device state.

## How the draft maps this

community/drafts/snapmaker-2x0-v2.draft.json is a schema-v2 profile with HTTP status read (status, connect, enclosure) and thermal/position state, marked unverified. Print start, upload and camera are not mapped.

UDP and the SSTP binary control plane are real, but the v2 JSON profile schema has no UDP or raw-TCP binary channel kind yet, so both are documented here instead of in the draft.

## Validating the draft

    node scripts/validate.mjs

The draft lives in community/drafts/, outside the validation roots, so it never blocks CI. To lint against community/schema/profile-v2.schema.json, copy it into community/profiles/ temporarily and run the validator.

## What is still missing

1. Confirm pairing flow and status schema on real 2.0 firmware.
2. Confirm whether START_WORK/PAUSE/RESUME/STOP op-codes are reachable over TCP on a known port; firmware transport here is UART to the HMI, and the LAN-accessible layer (8080 bridge) command verbs are not yet mapped.
3. A custom transport adapter in the MakerSpell app is required for any custom protocol before a profile can ship (CONTRIBUTING.md).
