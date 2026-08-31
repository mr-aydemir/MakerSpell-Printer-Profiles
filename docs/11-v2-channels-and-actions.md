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

Available safe transforms are `enum`, `default`, `scale`, `clamp`, `round`,
`uppercase`, `required`, `allowed` and `nonZero`. There is no script or
expression evaluation.

## Live interface composition

`ui.pages.control.sections` is the ordered source of the live printer control
screen when a v2 transport is selected. JSON chooses from an audited Flutter
component registry; it cannot name a Dart class or inject widget code.

Registered components currently include:

- `printerStatus`, `activeJob`
- `camera`, `deviceControls`
- `filamentBay`, `fileBrowser`
- `motionControls`, `excludeObjects`
- `deviceInterface`, `printHistory`, `timelapses`
- the compatibility components `temperatureControls` and `fanControls`

The runtime hides a declared component when its required capability is not
available. For example, `camera` is shown only when the profile declares at
least one safe camera candidate. The same section order is used on phones,
tablets and desktop; the `adaptiveDashboard` layout changes its column count.

The in-app v2 editor exposes identity, permissions, channels, operations,
workflows, actions, normalized state, media and UI as separate form cards. Its
JSON and Preview tabs edit the same document. A local save keeps one previous
validated revision so contributors can restore it without reinstalling the
application.

When the profile manager is opened from a printer, **Use as primary transport**
runs the profile's required discovery probes against that exact LAN printer.
The app persists `community-v2:<profile-id>` only after the probes match. An
active experimental profile exposes **Restore**, which returns the printer to
the compiled adapter named by `identity.replaces`. This explicit activation is
the device-test path; catalog installation alone never silently replaces a
production adapter.

## Cameras

Camera candidates live in `media.camera.candidates` with an HTTP channel,
printer-relative path, optional query, and renderer kind. The generic camera
discovery/cache layer validates the candidate; the URL is profile data.

## Boundary

JSON can define wire channels, commands, normalized state, finite workflows,
camera candidates and standard device actions. A genuinely new wire protocol
requires one audited reusable runtime primitive. Another printer using an
existing primitive requires only a profile and tests.
