# 4. Operations and delegation

Operations connect UI capabilities to printer-local protocol requests.

## Delegated operation

`delegate` keeps using a reviewed compiled adapter:

```json
"operations": {
  "status": {"kind": "delegate", "action": "fetchStatus"},
  "setFan": {"kind": "delegate", "action": "setFan"},
  "pause": {"kind": "delegate", "action": "pause"}
}
```

The action is executed by the selected compiled transport. The profile chooses
from an allow-list; it cannot name an arbitrary Dart method or network target.

## Operation IDs

| Group | IDs |
| --- | --- |
| Status/files | `status`, `listFiles`, `uploadFile`, `startPrint` |
| Job control | `pause`, `resume`, `cancel` |
| Device control | `setNozzleTemperature`, `setBedTemperature`, `setFan`, `setLight`, `setSpeed`, `move`, `home` |
| Print preparation | `autoLevel`, `flowCalibration`, `timelapse` |

Standard IDs connect to MakerSpell's built-in status, file and control UI.
Profiles may also define namespaced/custom IDs for custom buttons. Operation
IDs have permission requirements. See
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

## Direct HTTP operation

```json
"status": {
  "kind": "http",
  "method": "GET",
  "path": "/api/status",
  "response": {
    "fields": {
      "printerState": "$.result.state",
      "progress": "$.result.progress",
      "bedTemperature": "$.result.bed.actual"
    }
  }
}
```

Paths must be printer-relative. MakerSpell combines them with the selected
printer's IP and the profile's `connection` block.

## WebSocket and G-code

`websocket` sends a command template and consumes one bounded response. `gcode`
uses the reviewed HTTP or WebSocket channel declared in `connection.gcode`.

See [Building a declarative driver](09-declarative-driver.md) for request bodies,
multipart upload, authentication, response mapping, and testing.

## Common mistakes

- UI control references an operation that does not exist.
- Operation exists but its required permission is absent.
- URL is absolute instead of printer-relative.
- A credential is embedded in headers instead of using secure authentication.
- Profile declares upload/start even though the compiled adapter lacks the
  corresponding capability.

---

Previous: [Permissions and security](03-permissions-and-security.md)  
Next: [Interface controls](05-interface-controls.md)
