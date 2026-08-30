# 8. Troubleshooting

## Permission chip is not selected

The form shows permissions declared by the override, not every capability in
the base adapter. Save a control using the operation to add the required
permission automatically, or declare it in JSON.

For ordinary send-and-print support, verify all four pieces exist:

```json
"permissions": ["fileUpload", "printStart"],
"operations": {
  "uploadFile": {"kind": "delegate", "action": "uploadFile"},
  "startPrint": {"kind": "delegate", "action": "startPrint"}
}
```

The compiled adapter must also list `upload` and `startPrint` capabilities.

## Added control only says “New control”

Use **Add** to open the editor, fill the fields, and save. Existing cards can be
edited by tapping them or selecting the pencil icon. Older app builds created a
placeholder immediately; update MakerSpell or edit the raw JSON.

## Profile becomes invalid after choosing an operation

Check that:

- the operation exists in `operations`;
- the operation ID is allowed by the schema;
- its required permission is present;
- the control ID is unique;
- `step` is greater than zero;
- `min`, `max`, and `step` are numbers.

## Control is missing from the printer page

- Verify that the profile matches the printer.
- Check `visibleWhen`; unknown conditions hide the control.
- Confirm the compiled transport exposes the required capability.
- Confirm the control type and operation are spelled exactly.
- Use Preview to distinguish layout problems from live status conditions.

## Button is visible but operation fails

- Only reviewed `delegate` actions execute from interface controls today.
- Confirm the base transport implements the delegate action.
- Confirm firmware exposes the required command or contract.
- Refresh printer status after firmware or configuration changes.

## `gcodeTransform` is not selected

This is expected unless the profile defines `autoLevel`, `flowCalibration`, or
`timelapse`. Upload and print start use separate permissions.

## Profile matches the wrong printer

Tighten `modelRegex`, `hostnameRegex`, `serviceTypes`, or `ports`. Remember that
all declared rules must agree. Test against similar models before publishing.

## Need a new protocol

JSON cannot implement it. Open an issue describing protocol documentation,
authentication, discovery evidence, and available test hardware. A reviewed
compiled transport must be added before a profile can delegate to it.

---

Previous: [Testing and contributing](07-testing-and-contributing.md)  
Back to: [Documentation index](README.md)
