# MakerSpell Printer Profiles

Community-maintained printer, process, filament, and MakerSpell control profiles.

## Repository layout

- `profiles/`: Orca-compatible printer, process, and filament profiles.
- `community/`: MakerSpell declarative printer-control profiles and JSON schemas.
- `built-in/`: generated adapters and UI capability overlay for code compiled into MakerSpell.
- `schema/`: schema for generated built-in adapter snapshots.
- `metadata/profiles-sources.json`: pinned upstream provenance.
- `catalog/profiles-manifest.json`: integrity metadata for the latest release.

Profiles are distributed through GitHub Releases. MakerSpell downloads
`profiles-manifest.json`, verifies the archive size and SHA-256 digest, and
only then installs the package.

## Current application behavior

[`built-in/registry-v1.json`](built-in/registry-v1.json) exposes the connection
protocols, discovery evidence, capabilities, optional runtime contracts, UI
sections, device controls, and print options used by the current application.
It is generated from MakerSpell's real `PrinterTransportRegistry` so contributors
can review shipped behavior before opening an issue or pull request.

MakerSpell loads this registry through `catalog/runtime-v1.json` at an immutable
Git commit and verifies its SHA-256 digest. The runtime overlay may select a
compiled adapter or hide/restrict capabilities, controls, UI sections, and print
options. It cannot add protocol code, commands, hosts, or capabilities that are
not already implemented and verified in the installed application.

## Contributing

New to the profile system? Start with the
**[Printer profile documentation](docs/README.md)**. It explains the architecture,
permissions, operations, interface controls, print options, testing, and the
contribution workflow page by page.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Pull requests must keep JSON valid and
must not contain credentials, access tokens, absolute third-party operation
URLs, or executable scripts.

The base profile data is derived from the projects identified in
`metadata/profiles-sources.json`. See [NOTICE.md](NOTICE.md) for provenance.
