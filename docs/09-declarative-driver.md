# 9. Building a declarative printer driver

Use a declarative driver when the printer exposes ordinary local HTTP,
WebSocket, or G-code-over-HTTP/WebSocket APIs. No MakerSpell application change
is required.

## 1. Connection

```json
"baseTransport": "declarative",
"connection": {
  "scheme": "http",
  "port": 7125,
  "basePath": "",
  "timeoutMs": 8000,
  "authentication": {
    "type": "bearer",
    "header": "Authorization",
    "prefix": "Bearer "
  }
}
```

Authentication types are `none`, `bearer`, `apiKeyHeader`, and `basic`. The
credential is read from Android Keystore/iOS Keychain. Never put a token,
password, cookie, or API key in the profile.

## 2. Status mapping

```json
"status": {
  "kind": "http",
  "method": "GET",
  "path": "/api/status",
  "response": {
    "successPath": "$.ok",
    "successValues": [true],
    "messagePath": "$.message",
    "fields": {
      "printerState": "$.data.state",
      "progress": "$.data.progress",
      "filename": "$.data.filename",
      "nozzleTemperature": "$.data.hotend.actual",
      "nozzleTarget": "$.data.hotend.target",
      "bedTemperature": "$.data.bed.actual",
      "bedTarget": "$.data.bed.target",
      "elapsedSeconds": "$.data.elapsed",
      "remainingSeconds": "$.data.remaining"
    }
  }
}
```

The supported path subset is deterministic: `$.object.field[0].value`.
Mappings can also use `{ "path": "$.value", "type": "double", "scale": 100 }`.

## 3. Commands

```json
"setBedTemperature": {
  "kind": "http",
  "method": "POST",
  "path": "/api/temperature",
  "request": {
    "body": { "bed": "{{value}}" }
  }
}
```

Available runtime values include `filename`, `remotePath`, `value`, `enabled`,
`fanId`, `axis`, `axes`, `command`, `gcode`, and `startPrint`. An exact template
such as `"{{value}}"` preserves its numeric/boolean type.

## 4. File upload and print start

```json
"uploadFile": {
  "kind": "http",
  "method": "POST",
  "path": "/api/files",
  "request": {
    "encoding": "multipart",
    "fileField": "file",
    "fields": { "folder": "gcodes" }
  }
},
"startPrint": {
  "kind": "http",
  "method": "POST",
  "path": "/api/print",
  "request": { "body": { "filename": "{{filename}}" } }
}
```

## 5. G-code channel

```json
"connection": {
  "scheme": "http",
  "port": 7125,
  "gcode": {
    "kind": "http",
    "method": "POST",
    "path": "/printer/gcode/script",
    "request": { "body": { "script": "{{command}}" } }
  }
}
```

An operation can then use `{ "kind": "gcode", "command": "G28" }`.

## 6. Camera and filament slots

Camera discovery is data, not vendor code. A `camera` operation maps a
printer-relative path and stream kind:

```json
"camera": {
  "kind": "http",
  "method": "GET",
  "path": "/api/camera",
  "response": {
    "fields": {
      "path": "$.streamPath",
      "kind": "$.kind",
      "refreshIntervalMs": "$.refreshIntervalMs"
    }
  }
}
```

The returned path must start with `/`; MakerSpell rebuilds the URL using the
selected printer address. Supported kinds are `snapshot`, `mjpeg`, `webPage`,
`webRtc`, `flv`, and `rtsp`.

`listFilaments` uses the same item mapping model as `listFiles`:

```json
"response": {
  "itemsPath": "$.slots",
  "itemFields": {
    "index": "$.index",
    "hasFilament": "$.loaded",
    "colorHex": "$.color",
    "materialType": "$.material",
    "vendor": "$.vendor",
    "slotLabel": "$.label"
  }
}
```

## 7. Form, JSON and Preview

The Form tab edits discovery, connection/authentication, permissions,
operations and interface controls. Each control selects an operation; therefore
the same Flutter component library can safely render different vendor APIs.
Use the JSON tab for advanced response mappings or G-code channel definitions,
and Preview to verify layout before installation.

The profile describes communication and normalized data. It does not inject
arbitrary Flutter widgets or execute code. This keeps community drivers
reviewable, portable and sandboxed.

## Security boundary

- Every path must begin with `/`; absolute URLs and `..` are rejected.
- The host is always the selected printer IP.
- Redirects are disabled.
- Timeouts and responses are bounded.
- Host, connection, proxy, cookie, and authorization headers cannot be supplied
  as static profile data.
- Dangerous UI actions should set `confirm: true`.
- Profiles are schema-validated before installation.

## Testing in MakerSpell

Open **Printer profiles → profile → Form**. Configure the connection, add/edit
operations, connect controls to operations, inspect Preview, then use **Validate
& install**. Test status first, then harmless read operations, then controls,
upload, and print start. Submit a suggestion only after testing against the
declared model and firmware. See
`community/profiles/example-declarative-http.json` for an end-to-end template.

## When compiled code is still required

Use a compiled adapter for a proprietary binary protocol, native SDK, custom
encryption/pairing handshake, long-lived multiplexed stream, or protocol primitive
not yet provided by the declarative runtime. Add a reusable runtime primitive
when several printer families share that protocol; do not add one adapter per
model.
