# 1. Architecture and mental model

MakerSpell separates printer support into three layers.

## Layer 1: protocol runtime

A normal community driver uses MakerSpell's sandboxed declarative runtime. Its
JSON profile describes printer-local HTTP/WebSocket requests, authentication,
response mappings, upload behavior, print-start behavior, and UI controls.

The runtime always rebuilds URLs from the printer selected by the user. A
profile cannot select an Internet host, follow redirects, inject credentials,
or execute application code.

Compiled transports remain an escape hatch for native crypto, proprietary
binary codecs, MQTT dialects, or protocols that cannot be represented by the
reviewed runtime primitives.

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

A file in `community/profiles/` can be either a declarative driver
(`baseTransport: declarative`) or an override of a compiled adapter. It narrows
the target with `match`, declares permissions, describes operations, and
defines UI controls.

```text
Discovered printer
       |
       v
community profile match
       |
       v
declarative runtime or compiled fallback
       |
       v
permissions + operation declarations
       |
       v
responsive MakerSpell controls
       |
       v
printer-local protocol
```

## Why the layers are separate

- The application remains safe: remote JSON cannot execute arbitrary code.
- Contributors can correct labels, matching, visibility, and supported controls
  without waiting for a full application release.
- Most new HTTP/WebSocket printers require no application release.
- Firmware-specific differences can share one declarative profile family.
- Users can preview, test, approve, or remove a profile locally.

## Community approval is not code review

Approval counts report that users tested a profile version or feature. A high
count is useful evidence, but it does not grant additional permissions and does
not bypass schema, catalog, or owner review.

---

Previous: [Documentation index](README.md)  
Next: [Profile anatomy and printer matching](02-profile-anatomy.md)
