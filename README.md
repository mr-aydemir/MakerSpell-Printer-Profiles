# MakerSync Printer Profiles

Community-maintained printer, process, filament, and MakerSync control profiles.

## Repository layout

- `profiles/`: Orca-compatible printer, process, and filament profiles.
- `community/`: MakerSync declarative printer-control profiles and JSON schemas.
- `metadata/profiles-sources.json`: pinned upstream provenance.
- `catalog/profiles-manifest.json`: integrity metadata for the latest release.

Profiles are distributed through GitHub Releases. MakerSync downloads
`profiles-manifest.json`, verifies the archive size and SHA-256 digest, and
only then installs the package.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Pull requests must keep JSON valid and
must not contain credentials, access tokens, absolute third-party operation
URLs, or executable scripts.

The base profile data is derived from the projects identified in
`metadata/profiles-sources.json`. See [NOTICE.md](NOTICE.md) for provenance.

