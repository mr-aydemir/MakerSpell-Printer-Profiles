# 9. Building a declarative printer driver

Use a declarative driver when the printer exposes local HTTP/HTTPS, WebSocket,
MQTT/MQTTS, FTP/FTPS, TCP/TCPS console, or G-code-over-HTTP/WebSocket APIs. A profile can combine
these channels; for example, HTTP for status, MQTT for controls, and FTPS for
file transfer. No printer-specific MakerSpell application change is required.

## 1. Connection channels

`connection` is the only place where network channels are configured. The
top-level HTTP settings are also the origin for WebSocket operations: `http`
becomes `ws`, and `https` becomes `wss`.

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

Authentication types are `none`, `bearer`, `apiKeyHeader`, `basic`, and
`usernamePassword`. The
credential is read from Android Keystore/iOS Keychain. Never put a token,
password, cookie, or API key in the profile.

### MQTT / MQTTS

```json
"connection": {
  "scheme": "https",
  "mqtt": {
    "scheme": "mqtts",
    "port": 8883,
    "clientId": "makerspell_{{timestamp}}",
    "keepAliveSeconds": 15,
    "authentication": {
      "type": "usernamePassword",
      "username": "printer"
    }
  }
}
```

An MQTT operation declares the publish topic, optional response topic and QoS.
The request `payload` is JSON-templated before publishing. When no response
topic is present, publishing successfully completes the operation.

```json
"setFan": {
  "kind": "mqtt",
  "topic": "printer/control/fan",
  "responseTopic": "printer/reply/fan",
  "qos": 1,
  "request": { "payload": { "fan": "{{fanId}}", "percent": "{{value}}" } },
  "response": { "successPath": "$.ok", "successValues": [true] }
}
```

### FTP / FTPS

```json
"connection": {
  "scheme": "http",
  "ftp": {
    "scheme": "ftps",
    "port": 990,
    "tlsMode": "implicit",
    "rootPath": "/gcodes",
    "authentication": {
      "type": "usernamePassword",
      "username": "printer"
    }
  }
}
```

FTP operations use one of `list`, `upload`, or `delete`. Paths are absolute on
the printer and may use safe runtime templates.

```json
"listFiles": { "kind": "ftp", "action": "list", "path": "/gcodes" },
"uploadFile": {
  "kind": "ftp",
  "action": "upload",
  "path": "/gcodes/{{filename}}"
},
"deleteFile": {
  "kind": "ftp",
  "action": "delete",
  "path": "{{remotePath}}"
}
```

FTPS uses platform certificate validation. Community profiles cannot disable
TLS verification or embed credentials.

### TCP / TCPS console

Use this channel for printers that expose a line-oriented raw socket console.
`tcps` enables TLS with platform certificate validation. It is not Telnet: the
runtime does not negotiate Telnet options or execute an interactive shell.

```json
"connection": {
  "scheme": "http",
  "tcp": {
    "scheme": "tcp",
    "port": 8899,
    "lineEnding": "crlf",
    "responseMode": "line",
    "maxResponseBytes": 1048576
  }
}
```

`lineEnding` is `none`, `lf`, or `crlf`. `responseMode` is `none` for
fire-and-forget commands, `line` for the first LF-terminated reply, or `close`
to read until the printer closes the connection.

```json
"consoleStatus": {
  "kind": "tcp",
  "command": "STATUS",
  "response": {
    "fields": { "printerState": "$.state" }
  }
}
```

Connections always target the selected printer IP and declared port. Response
size and duration remain bounded by the profile limits.

### WebSocket

WebSocket does not need a second connection block. It uses the HTTP host, port,
base path, authentication, and timeout declared above.

```json
"status": {
  "kind": "websocket",
  "path": "/websocket",
  "command": "{\"method\":\"status\"}",
  "response": { "fields": { "printerState": "$.result.state" } }
}
```

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

The Form tab exposes HTTP/WebSocket, MQTT/MQTTS, FTP/FTPS and TCP/TCPS as separate
connection cards. The operation editor then selects which channel an operation
uses. It also edits discovery, permissions and interface controls. Each control selects an operation; therefore
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
