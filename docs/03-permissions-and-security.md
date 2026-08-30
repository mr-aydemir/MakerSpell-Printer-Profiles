# 3. Permissions and security

Permissions are an explicit allow-list for a community profile. They document
risk and prevent a profile from silently gaining access to a sensitive action.

## Permission reference

| Permission | Allows | Common operation IDs |
| --- | --- | --- |
| `statusRead` | Read and display printer status. | `status` |
| `fileListRead` | Display files stored on the printer. | `listFiles` |
| `fileUpload` | Upload a G-code file through the base transport. | `uploadFile` |
| `printStart` | Start a stored or newly uploaded print. | `startPrint` |
| `printControl` | Pause, resume, or cancel an active job. | `pause`, `resume`, `cancel` |
| `deviceControl` | Change temperatures, fans, lights, speed, or motion. | `setFan`, `setLight`, `move`, `home` |
| `cameraRead` | Display the printer camera through the base transport. | Managed camera UI |
| `gcodeTransform` | Enable reviewed print-preparation features. | `autoLevel`, `flowCalibration`, `timelapse` |

## What `gcodeTransform` means

`gcodeTransform` is not a general “run arbitrary G-code” switch. In the current
runtime it authorizes known print-preparation options such as auto-leveling,
flow calibration, and timelapse. The reviewed base transport still decides how
the option is applied and whether firmware support exists.

Do not select it for ordinary upload or print start; those use `fileUpload` and
`printStart`.

## Why some permissions are not selected

The form shows permissions declared by the current override, not every possible
capability of the base transport. A generated system override normally copies
the relevant compiled capabilities. A manually created profile must add them
when it defines the matching operation.

The MakerSpell form automatically selects the required permission when you save
an interface control for an operation. JSON edits are validated and rejected if
an operation is missing its required permission.

## Security boundaries

- Profiles cannot contain credentials, cookies, tokens, or private user data.
- Absolute third-party operation URLs are forbidden.
- A profile cannot widen the capabilities of its compiled base transport.
- Unknown operations, control types, placeholders, and permissions are rejected.
- Profiles fetched from GitHub are pinned to immutable content and verified by
  catalog SHA-256 metadata.
- Local installation is for testing; publication still requires review.

## Least privilege

Declare only what the profile uses. Fewer permissions make the profile easier to
review and make unexpected behavior less likely.

---

Previous: [Profile anatomy](02-profile-anatomy.md)  
Next: [Operations and delegation](04-operations.md)
