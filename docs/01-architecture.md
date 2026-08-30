# 1. Architecture and mental model

MakerSpell separates printer support into three layers.

## Layer 1: compiled transport

A transport is reviewed application code that implements a protocol such as
Moonraker, OctoPrint, PrusaLink, Bambu LAN, or Creality Local. It owns network
requests, authentication, upload behavior, print-start behavior, and device
commands.

A JSON profile cannot create a new transport. A new proprietary protocol must
first be implemented and reviewed in the MakerSpell application.

## Layer 2: built-in runtime registry

[`built-in/registry-v1.json`](../built-in/registry-v1.json) is a generated,
data-only snapshot of compiled transports. For every adapter it lists:

- discovery service types and default ports;
- protocol and authentication information;
- compiled capabilities and optional contracts;
- visible interface sections;
- job and device controls;
- print-preparation behavior.

MakerSpell verifies the registry digest before applying it. The registry can
select or restrict compiled behavior, but cannot add code or widen the installed
application's abilities.

## Layer 3: community profile

A file in `community/profiles/` is a declarative override. It references a
compiled adapter through `baseTransport`, narrows the target with `match`,
declares permissions, maps safe operations, and defines UI controls.

```text
Discovered printer
       |
       v
built-in adapter match
       |
       v
community profile match (optional override)
       |
       v
permissions + operation declarations
       |
       v
responsive MakerSpell controls
       |
       v
reviewed compiled transport
```

## Why the layers are separate

- The application remains safe: remote JSON cannot execute arbitrary code.
- Contributors can correct labels, matching, visibility, and supported controls
  without waiting for a full application release.
- Firmware-specific differences can share one audited transport.
- Users can preview, test, approve, or remove a profile locally.

## Community approval is not code review

Approval counts report that users tested a profile version or feature. A high
count is useful evidence, but it does not grant additional permissions and does
not bypass schema, catalog, or owner review.

---

Previous: [Documentation index](README.md)  
Next: [Profile anatomy and printer matching](02-profile-anatomy.md)
