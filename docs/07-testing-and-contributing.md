# 7. Testing and contributing

## Local workflow

1. Find the closest adapter in
   [`built-in/registry-v1.json`](../built-in/registry-v1.json).
2. Create an override in MakerSpell or copy
   [`example-klipper.json`](../community/profiles/example-klipper.json).
3. Narrow the `match` rules to the tested model/firmware.
4. Declare the minimum permissions and delegated operations.
5. Build controls and print options.
6. Check the **Preview** tab on phone, tablet, and desktop widths.
7. Select **Validate & install** and test only on hardware you control.
8. Run repository validation.

```bash
npm ci
npm test
```

## What to test

- discovery and correct adapter selection;
- status refresh and offline behavior;
- every visible control and its reported value;
- file list, upload, and print start separately;
- pause, resume, and cancel only during an active job;
- all reported fans and their current percentages;
- camera startup and failure behavior;
- print options on the exact firmware version;
- responsive layout and long translated labels.

Never perform destructive tests on an unattended printer.

## Pull request evidence

Include:

- printer manufacturer and exact model;
- firmware version;
- selected `baseTransport`;
- discovery service type and port (no private address required);
- operations tested and their outcomes;
- screenshots with private data removed;
- limitations or untested features.

Do not include passwords, tokens, cookies, serial numbers, private IP addresses,
or personal files.

## Versioning

- Patch: labels, narrow matching corrections, non-behavioral metadata.
- Minor: new reviewed controls or optional capabilities.
- Major: incompatible meaning or behavior changes.

Changing a profile version intentionally starts a new approval record so users
do not appear to have approved behavior they never tested.

## Publication flow

Local install and suggestion submission do not publish immediately. A proposal
must pass schema validation, security checks, catalog integrity generation, and
review. Published files are distributed from immutable Git content with digest
verification.

---

Previous: [Print options](06-print-options.md)  
Next: [Troubleshooting](08-troubleshooting.md)
