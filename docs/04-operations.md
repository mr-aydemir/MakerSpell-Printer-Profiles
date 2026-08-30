# 4. Operations and delegation

Operations connect a declarative profile to reviewed behavior.

## Delegated operation

The normal production form is `delegate`:

```json
"operations": {
  "status": {"kind": "delegate", "action": "fetchStatus"},
  "setFan": {"kind": "delegate", "action": "setFan"},
  "pause": {"kind": "delegate", "action": "pause"}
}
```

The action is executed by the selected compiled transport. The profile chooses
from an allow-list; it cannot name an arbitrary Dart method or network target.

## Supported operation IDs

| Group | IDs |
| --- | --- |
| Status/files | `status`, `listFiles`, `uploadFile`, `startPrint` |
| Job control | `pause`, `resume`, `cancel` |
| Device control | `setNozzleTemperature`, `setBedTemperature`, `setFan`, `setLight`, `setSpeed`, `move`, `home` |
| Print preparation | `autoLevel`, `flowCalibration`, `timelapse` |

Operation IDs have permission requirements. See
[Permissions and security](03-permissions-and-security.md).

## Upload and print-start operations

`uploadFile` and `startPrint` are authorization gates for the normal MakerSpell
send workflow. The base transport still performs the actual upload and start.

```json
"uploadFile": {"kind": "delegate", "action": "uploadFile"},
"startPrint": {"kind": "delegate", "action": "startPrint"}
```

If an installed matching community profile omits these declarations, MakerSpell
intentionally blocks the corresponding operation instead of bypassing the
profile's permission boundary.

## Reserved operation kinds

The schema also recognizes `http`, `websocket`, and `gcode`. They are parsed and
validated for forward compatibility, but direct execution is disabled unless a
reviewed runtime adapter provides the behavior. Do not assume that a raw request
or command in JSON will run on a user's printer.

## Common mistakes

- UI control references an operation that does not exist.
- Operation exists but its required permission is absent.
- Delegate action is misspelled or unsupported by the base transport.
- Profile declares upload/start even though the compiled adapter lacks the
  corresponding capability.

---

Previous: [Permissions and security](03-permissions-and-security.md)  
Next: [Interface controls](05-interface-controls.md)
