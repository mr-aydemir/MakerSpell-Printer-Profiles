# Contributing printer support

If this is your first contribution, read the
[step-by-step profile documentation](docs/README.md) before editing JSON.

1. Fork this repository and create a focused branch.
2. Change only the affected vendor/profile files.
3. For a MakerSpell control profile, update or add a file below
   `community/profiles/` and validate it against
   `community/schema/profile.schema.json`.
4. Describe the exact printer model, firmware version, transport, and physical
   operations tested.
5. Compare the proposal with `built-in/registry-v1.json`. If the shipped
   behavior is wrong, identify the adapter id and include firmware evidence.
6. Never include passwords, cookies, tokens, private addresses, or user data.

Control profiles are declarative. New proprietary protocols require a reviewed
transport adapter in the MakerSpell application before a JSON profile can use
them. Pull requests affecting upload, print-start, G-code transformation, or
device-control permissions require owner review.
