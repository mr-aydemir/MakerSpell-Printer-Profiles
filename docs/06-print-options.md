# 6. Print options

`ui.printOptions` adds reviewed choices to the send-to-printer screen.

```json
"printOptions": [
  {
    "id": "autoLevel",
    "label": "Automatic bed leveling",
    "operation": "autoLevel",
    "default": false
  }
]
```

## Fields

| Field | Purpose |
| --- | --- |
| `id` | Stable feature ID used for approvals. |
| `label` | User-facing option label. |
| `operation` | `autoLevel`, `flowCalibration`, or `timelapse`. |
| `default` | Initial checkbox state. Prefer `false` for optional calibration. |

## Runtime behavior

Community options reuse MakerSpell's reviewed print-preparation pipeline. The
base transport reports whether and how an option is supported:

- transport-managed operation;
- reviewed tool command;
- native vendor flow;
- unsupported.

If the native print screen already exposes the same option, MakerSpell avoids
showing a duplicate community checkbox.

## Permission requirement

These operations require `gcodeTransform`, even when a transport applies the
feature without literally rewriting the whole file. The name represents the
sensitive print-preparation boundary.

## Calibration guidance

- Do not guess firmware macro names.
- Verify the command or native path on the exact model and firmware version.
- Prefer dynamic firmware capability discovery when the transport supports it.
- Keep the option disabled when the reviewed transport cannot implement it.
- Document physical test results in the pull request.

---

Previous: [Interface controls](05-interface-controls.md)  
Next: [Testing and contributing](07-testing-and-contributing.md)
