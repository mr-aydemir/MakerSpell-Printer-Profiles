# 11. V2 channels and actions

This page explains where a profile defines the actual printer communication.
The form editor is a visual editor for these same JSON fields; it does not
invent an adapter behind the profile.

## Named channels

Each channel fixes a protocol, scheme and printer-local port. The runtime
always supplies the selected printer IP, so a profile cannot redirect traffic
to an internet host.

- `http`: HTTP/HTTPS requests and multipart upload.
- `websocket`: WS/WSS JSON or text commands with bounded response matching.
- `mqtt`: MQTT/MQTTS publish and optional response-topic subscription.
- `ftp`: FTP/FTPS list, upload and delete within a declared root path.
- `tcp`: TCP/TCPS console commands with bounded response modes.

MQTT uses `clientId` and `keepAliveSeconds`; TCP uses `lineEnding` and
`responseMode`; FTP uses `tlsMode`, `rootPath` and optional `username`. Secrets
never belong in JSON. They are read through the printer's OS-backed credential
reference.

## Operations

An operation selects one named channel:

```json
{
  "channels": {
    "console": {
      "kind": "tcp",
      "scheme": "tcp",
      "port": 8888,
      "lineEnding": "lf",
      "responseMode": "line"
    }
  },
  "operations": {
    "firmware": {
      "channel": "console",
      "send": { "text": "M115" },
      "map": "firmwareReply"
    }
  }
}
```

MQTT operations use `send.topic`, optional `send.responseTopic`, `send.qos`
and a JSON or text payload. FTP operations use `send.ftpAction` (`list`,
`upload`, `delete`) and `send.bytesVariable` for uploads.

## UI actions

`actions` connects a semantic MakerSpell control to an operation. Argument
rules adapt the generic command to the wire format without Dart code:

```json
"actions": {
  "partFan": {
    "operation": "setFan",
    "arguments": {
      "fanIndex": {
        "from": "fanId",
        "enum": { "model": 0, "rear": 1, "auxiliary": 2 }
      },
      "pwm": {
        "from": "value",
        "scale": 2.55,
        "clamp": [0, 255],
        "round": true
      }
    }
  }
}
```

Available safe transforms are `enum`, `default`, `scale`, `clamp`, `round`
and `uppercase`. There is no script or expression evaluation.

## Cameras

Camera candidates live in `media.camera.candidates` with an HTTP channel,
printer-relative path, optional query, and renderer kind. The generic camera
discovery/cache layer validates the candidate; the URL is profile data.

## Boundary

JSON can define wire channels, commands, normalized state, finite workflows,
camera candidates and standard device actions. A genuinely new wire protocol
requires one audited reusable runtime primitive. Another printer using an
existing primitive requires only a profile and tests.
