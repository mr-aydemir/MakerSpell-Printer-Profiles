# 10. Full JSON printer driver v2 roadmap

## Objective

MakerSpell v2 profiles must define a printer's discovery, safe local
communication, normalized state, actions, print workflow and complete control
screen without printer-specific Dart code.

JSON remains data. MakerSpell supplies audited, versioned protocol and Flutter
UI primitives. Profiles compose these primitives. A genuinely new wire protocol
requires one reusable runtime primitive, not one adapter per printer model.

## Why v1 is not enough

V1 can add controls and execute simple protocol operations, but it does not own
the whole printer experience:

- built-in profiles commonly use `baseTransport` and `delegate` operations;
- HTTP and WebSocket share one port;
- WebSocket cannot select a response from a stream or poll safely;
- upload/start/calibration sequences remain compiled transport methods;
- camera, files, filaments, history and timelapses are partly compiled UI;
- discovery probes and firmware alternatives are not workflows;
- approval records do not prove operation and UI conformance.

These are architectural limits, so v2 is a new schema rather than a growing
set of v1 exceptions.

## V2 document structure

```json
{
  "schemaVersion": 2,
  "id": "community.creality.k1-family",
  "version": "2.0.0",
  "identity": {},
  "permissions": [],
  "credentials": {},
  "discovery": {},
  "channels": {},
  "operations": {},
  "workflows": {},
  "state": {},
  "ui": {},
  "verification": {}
}
```

### Identity and permissions

`identity` declares author, repository, models, firmware ranges, minimum
MakerSpell runtime, license and release notes. `permissions` is a least-
privilege list. Installation shows the exact grants and version-to-version
changes.

### Credentials

Profiles declare named references to OS-backed secrets. JSON may describe a
field label and authentication role but never stores passwords, tokens, cookies
or private keys.

### Discovery

Discovery generates candidates and gathers evidence using:

- mDNS service types and ports;
- HTTP assertions;
- WebSocket challenge/response;
- MQTT broker availability;
- TCP banner or command/reply;
- extracted model, firmware and capabilities;
- weighted positive and negative evidence.

Every probe is restricted to the candidate printer.

### Named channels

Channels are independent, so HTTP and WebSocket can use different ports:

```json
"channels": {
  "web": {
    "kind": "http",
    "scheme": "http",
    "port": 80,
    "timeoutMs": 5000
  },
  "control": {
    "kind": "websocket",
    "scheme": "ws",
    "port": 9999,
    "path": "/",
    "lifecycle": "perOperation"
  }
}
```

Initial audited channel kinds are HTTP/HTTPS, WebSocket/WSS, MQTT/MQTTS,
FTP/FTPS and TCP/TCPS line console. Profiles cannot load executable code.

### Operations

Operations reference channels and define request encoding, bounded response
collection and normalized mapping:

```json
"status": {
  "channel": "control",
  "send": {
    "json": { "method": "get", "params": { "status": 1 } }
  },
  "receive": {
    "until": { "pathExists": "$.result.status" },
    "timeoutMs": 5000,
    "maxMessages": 20
  },
  "map": "crealityStatus"
}
```

Receive modes include first message, matching message, collect-until,
connection close and no response. Every mode has time, count and byte limits.

### Normalized state

Vendor responses map into one state tree read by every UI component:

```text
printer.connection
printer.identity
printer.temperatures[]
printer.fans[]
printer.job
printer.motion
printer.camera[]
printer.files[]
printer.filaments[]
printer.alerts[]
printer.history[]
printer.timelapses[]
```

Mappings support safe JSON paths, aliases, conversion, scaling, enum maps,
defaults and list mapping. They cannot execute general-purpose code.

### Workflows

Finite workflows replace transport-specific methods:

- upload, wait for indexing, resolve path and start;
- authentication and pairing;
- explicit firmware alternatives;
- optional calibration steps;
- cleanup after failure;
- progress stages exposed to UI.

Allowed steps are `operation`, `branch`, `forEach`, `wait`, `retry`, `set`,
`assert` and `emit`. Loops and retries require fixed upper bounds.

### Complete UI

JSON defines pages, sections and registered components rather than an extra
card appended to a compiled screen:

```json
"ui": {
  "pages": {
    "control": {
      "layout": "adaptiveDashboard",
      "sections": [
        { "component": "printerStatus", "bind": "printer" },
        { "component": "activeJob", "bind": "printer.job" },
        { "component": "cameraGrid", "bind": "printer.camera" },
        { "component": "temperatureControls", "bind": "printer.temperatures" },
        { "component": "fanControls", "bind": "printer.fans" },
        { "component": "fileBrowser", "bind": "printer.files" }
      ]
    }
  }
}
```

Components are audited Flutter widgets. Profiles bind, order, hide and compose
them but cannot inject Flutter code. Every component declares phone, tablet and
desktop behavior.

### Verification

Verification records model, firmware, scrubbed fixture hashes, tested
operations/workflows/UI sections, MakerSpell version and timestamp. Community
approval is not a test result. Verified status requires conformance evidence.

## Runtime architecture

```text
Discovery engine
    -> profile selection
    -> permission and credential gate
    -> channel manager
    -> operation/workflow engine
    -> normalized state store
    -> JSON UI renderer
```

Compiled adapters remain temporarily behind a visible compatibility bridge. A
v2 profile cannot silently fall back to one and still claim
`fullyDeclarative`.

## Testing strategy

1. **Static validation:** schema, references, permissions, bounded workflows,
   forbidden hosts/secrets and responsive component compatibility.
2. **Fixture simulation:** scrubbed request/response captures run discovery,
   mapping, workflows and UI golden tests without a physical printer.
3. **Mock servers:** real HTTP, WebSocket, MQTT, FTP and TCP runtime tests.
4. **Device conformance:** guided read-only tests first; mutating/upload/start
   tests require separate confirmation and generate a shareable report.
5. **Firmware matrix:** verification is scoped to model and firmware range.

## Delivery phases

### A — V2 core

- named channels and separate HTTP/WebSocket ports;
- declarative discovery and probes;
- bounded response selectors;
- normalized state store;
- unchanged v1 loading.

Acceptance: mock-server tests cover every channel primitive.

#### Current Phase A implementation

The application now contains the first executable v2 slice:

- v1 and v2 profiles load side by side;
- HTTP and WebSocket are independent named channels with separate ports;
- HTTP probes and bounded WebSocket matching responses execute against the
  selected printer address;
- probe evidence produces a confidence score and required-probe result;
- safe state mappings merge into an observable normalized state store;
- the bundled experimental Creality profile exercises HTTP port 80 and
  WebSocket port 9999 without claiming feature parity.

MQTT, FTP and TCP already exist as v1 runtime primitives, but their v2 channel
adapters, workflow engine and full UI renderer remain Phase A/B/C work. The
experimental profile must not replace the verified compiled Creality adapter
until Phase D acceptance passes.

### B — Workflow engine

- upload/start, polling, retry and firmware alternatives;
- permissions derived from the workflow graph;
- cancellation and progress reporting.

Acceptance: mock Creality upload-and-start uses no compiled transport.

#### Current Phase B implementation

The app now executes bounded v2 workflow graphs and exposes them through a
real `PrinterTransport` implementation:

- `operation`, `branch`, `wait`, `retry`, `set`, `assert` and `emit` steps;
- a global execution budget, nesting limit, cancellation checks and bounded
  retry/wait values;
- multipart binary upload with live transfer progress;
- workflow stage events mapped to the standard upload/start UI;
- permissions checked from the complete workflow graph;
- explicit `community-v2:<profile-id>` activation while a profile remains
  experimental, preventing an unverified profile from replacing a production
  adapter;
- an experimental Creality upload-and-start workflow using HTTP port 80 and
  WebSocket port 9999 without calling the compiled Creality transport.

Mock-server tests prove a real multipart upload followed by a failed first
start attempt and a successful bounded retry. The Creality workflow remains
`fixtureOnly`: its mutating operations are intentionally marked untested until
device conformance confirms indexing paths and firmware variants.

### C — Full UI renderer

- registered component for every existing control-screen section;
- JSON owns order and visibility;
- phone, tablet and desktop golden tests;
- no `Managed by base transport` placeholders.

Acceptance: fixtures render the complete control page without legacy sections.

### D — Creality reference migration

- `/info` HTTP probe on port 80;
- control/status WebSocket on port 9999;
- multipart upload on port 80;
- indexing and start workflow;
- camera, fans, CFS, files, history, timelapses and alerts;
- K1, K1 Max and Hi/Hi Combo firmware fixtures.

Acceptance: disabling compiled `creality_local` changes no supported behavior
in conformance tests or verified devices.

### E — Community release

- form editor covers all v2 fields;
- advanced raw JSON view;
- restore and safe rollback;
- signed catalog, immutable hashes and staged rollout;
- pull requests include conformance evidence;
- approvals show profile version, model and firmware scope.

## Migration policy

1. V1 stays readable.
2. Built-in delegate profiles are labelled `compatibilityBridge`.
3. A profile is `hybrid` after its first declarative operation.
4. It is `fullyDeclarative` only when discovery, advertised capabilities,
   workflows and complete UI are v2-defined.
5. Compiled adapters are removed only after parity and rollback tests pass.

## Non-goals

- arbitrary Dart, JavaScript, shell or native code;
- disabling TLS verification from JSON;
- storing secrets in GitHub;
- unrestricted Internet endpoints;
- unbounded loops, streams or responses;
- claiming verification from UI preview or one vote.
