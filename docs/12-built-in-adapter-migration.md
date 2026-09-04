# Built-in adapter migration matrix

MakerSpell ships one schema-v2 profile for every compiled printer adapter.
Creality Local and Snapmaker U1 have device-tested declarative profiles. The
remaining profiles start as explicit compatibility bridges so users can edit
and review their discovery, protocol channels, permissions and UI composition
without losing the behavior of the existing adapter.

Compatibility bridges and profiles whose declared device-verification scope is
complete are enabled by default in MakerSpell when their model, discovery
service, or existing adapter identity matches. A profile that still lists
untested operations or workflows remains opt-in and cannot silently replace a
proven native adapter. Model allow-lists remain authoritative: a verified
profile for one device cannot attach itself to another printer in the same
manufacturer family. Compatibility bridges keep the native adapter as their
runtime fallback and inherit its support level.

A compatibility bridge is not a fully declarative driver. Its
`identity.delegateContracts` list is the exact inventory of behavior still
provided by compiled Dart code. Contributors should replace those entries one
at a time with bounded v2 operations, normalized state mappings and workflows,
then attach fixture and device-conformance evidence. A bridge must never use a
`fullyDeclarative` verification level.

| Family | V2 profile | Protocol channels represented | Migration state |
| --- | --- | --- | --- |
| Creality Local | `experimental-creality-local-v2.json` | HTTP, WebSocket, camera HTTP | Device verified |
| Snapmaker U1 | `experimental-snapmaker-u1-v2.json` | Moonraker HTTP and WebSocket | Device verified |
| Anycubic LAN | `bridge-anycubic-lan-v2.json` | handshake HTTP, upload HTTP, MQTTS | Compatibility bridge |
| Bambu Lab LAN | `bridge-bambu-lan-v2.json` | MQTTS, FTPS | Compatibility bridge |
| Qidi Moonraker | `bridge-qidi-moonraker-v2.json` | Moonraker HTTP/WebSocket, Fluidd HTTP | Compatibility bridge |
| Elegoo Link / SDCP | `bridge-elegoo-*.json` | HTTP; SDCP also WebSocket | Compatibility bridge |
| FlashForge / FlashAir | `bridge-flash*.json` | HTTP | Compatibility bridge |
| AstroBox | `bridge-astrobox-v2.json` | HTTP | Compatibility bridge |
| MKS WiFi | `bridge-mks-v2.json` | HTTP, TCP console | Compatibility bridge |
| ESP3D | `bridge-esp3d-v2.json` | HTTP | Compatibility bridge |
| Duet / RepRapFirmware | `bridge-duet-rrf-v2.json` | HTTP | Compatibility bridge |
| Repetier Server | `bridge-repetier-server-v2.json` | HTTP | Compatibility bridge |
| PrusaLink | `bridge-prusalink-v2.json` | HTTP | Compatibility bridge |
| OctoPrint | `bridge-octoprint-v2.json` | HTTP | Compatibility bridge |
| Generic Moonraker | `bridge-moonraker-v2.json` | HTTP, WebSocket | Compatibility bridge |

## Safe promotion checklist

1. Replace delegated discovery with required and optional profile probes.
2. Declare every request, response bound, credential requirement and channel.
3. Map status, files, materials and device-specific data to normalized fields.
4. Add bounded upload/start and control workflows.
5. Render the complete control page from registered JSON components.
6. Pass static schema validation, fixture tests and mock protocol tests.
7. Run guided tests on the declared model and firmware range.
8. Record which features worked or failed, then approve the tested profile
   version in the app. Real-device confirmations help maintainers promote
   reliable support for hardware they may not own.
9. Remove only the contracts proven equivalent and update verification scope.

This staged approach prevents a profile from claiming portability merely
because its JSON parses, while still making every existing manufacturer
visible and improvable through the same community workflow.
