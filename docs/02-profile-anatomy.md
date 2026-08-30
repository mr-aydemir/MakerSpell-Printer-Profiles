# 2. Profile anatomy and printer matching

Every profile follows the
[`profile.schema.json`](../community/schema/profile.schema.json) contract.

## Minimal shape

```json
{
  "$schema": "../schema/profile.schema.json",
  "schemaVersion": 1,
  "id": "community.vendor-model",
  "name": "Vendor Model",
  "version": "1.0.0",
  "baseTransport": "moonraker",
  "match": {
    "modelRegex": "^Vendor Model$",
    "serviceTypes": ["_moonraker._tcp.local"],
    "ports": [7125]
  },
  "permissions": ["statusRead"],
  "operations": {
    "status": {"kind": "delegate", "action": "fetchStatus"}
  },
  "ui": {
    "controls": [
      {
        "id": "status",
        "type": "status",
        "operation": "status",
        "label": "Printer status"
      }
    ],
    "printOptions": []
  }
}
```

## Identity fields

| Field | Purpose |
| --- | --- |
| `schemaVersion` | Profile format version. Currently `1`. |
| `id` | Stable, unique identifier such as `community.vendor-model`. |
| `name` | User-facing profile name. |
| `version` | Semantic version. Increase it when behavior changes. |
| `description` | Optional explanation of the supported printer/firmware. |
| `author` | Optional contributor name. |
| `repository` | Optional GitHub repository URL. |

Never reuse an existing ID for an unrelated printer. Approval records are tied
to profile ID and version.

## `baseTransport`

`baseTransport` must match an adapter ID already present in
[`built-in/registry-v1.json`](../built-in/registry-v1.json), for example
`moonraker`, `octoprint`, or `creality_local`.

Choosing a base transport does not automatically authorize every capability.
The profile must also declare the relevant permission and operation.

## `match`

At least one matching rule is required:

| Rule | Meaning |
| --- | --- |
| `modelRegex` | Regular expression applied to the reported model. |
| `hostnameRegex` | Regular expression applied to hostname. |
| `serviceTypes` | Exact discovered DNS-SD/mDNS service types. |
| `ports` | Valid network ports from `1` to `65535`. |

When several rules are present, they must all agree. Prefer the narrowest stable
evidence available. Avoid a broad expression such as `.*`, which can attach the
profile to unrelated printers.

## `operations` and `ui`

An operation names an allowed behavior. A UI control references that operation.
Both are required: declaring an operation alone does not create a button, and a
control cannot reference an undefined operation.

---

Previous: [Architecture](01-architecture.md)  
Next: [Permissions and security](03-permissions-and-security.md)
