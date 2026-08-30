# 5. Interface controls

`ui.controls` is an ordered list. The order in JSON is the order MakerSpell uses
in the responsive renderer. Controls flow into one, two, or three columns based
on available width.

## Shared fields

```json
{
  "id": "fans",
  "type": "fanList",
  "operation": "setFan",
  "label": "Fans",
  "valuePath": "fans",
  "visibleWhen": "status.fans",
  "min": 0,
  "max": 100,
  "step": 5,
  "unit": "%",
  "confirm": false
}
```

| Field | Purpose |
| --- | --- |
| `id` | Stable feature ID; must be unique inside the profile. |
| `type` | Renderer component to use. |
| `operation` | Defined operation invoked by the component. |
| `label` | User-facing title. |
| `valuePath` | Optional status value path. |
| `visibleWhen` | Optional runtime visibility condition. |
| `min`, `max`, `step` | Numeric input range. |
| `unit` | Display unit such as `°C` or `%`. |
| `confirm` | Ask before executing a potentially disruptive command. |

## Control types

| Type | Intended use |
| --- | --- |
| `status` | Printer state summary. |
| `job` | Active job/file summary. |
| `temperature` | Nozzle or bed target editor. |
| `fanList` | Dynamic list of firmware-reported fans. |
| `slider` | Numeric control such as speed percentage. |
| `toggle` | Boolean control such as a light. |
| `button` | One-shot operation. |
| `motion` | Homing/motion component. |
| `camera` | Base-transport-managed camera section. |
| `fileBrowser` | Base-transport-managed local files. |
| `filamentList` | Base-transport-managed filament slots. |
| `excludeObjects` | Object cancellation/exclusion UI. |
| `printHistory` | Completed print history. |
| `timelapseList` | Timelapse browser. |

## Visibility conditions

Current supported conditions are:

- `status.fans`
- `status.light`
- `status.nozzle`
- `status.bed`
- `status.job`
- `capability.<capabilityName>`

An unknown condition evaluates to hidden. This prevents a typo from exposing an
unsupported control.

## Using the in-app editor

1. Open **Form → Interface controls**.
2. Select **Add** to open the control editor.
3. Choose an existing operation; add operations in JSON when necessary.
4. Set ID, label, type, visibility, range, unit, and confirmation behavior.
5. Save, reorder the card by dragging, then check **Preview**.

Selecting an operation automatically enables its required permission. The
control is not added until the editor is saved.

## Managed sections versus action controls

Camera, files, filament, history, timelapse, and object exclusion are managed by
the base transport. Their profile control places the section; it does not
reimplement its network protocol.

---

Previous: [Operations and delegation](04-operations.md)  
Next: [Print options](06-print-options.md)
