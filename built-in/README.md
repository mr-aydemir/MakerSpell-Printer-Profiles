# Built-in adapter reference

`registry-v1.json` is a generated, data-only runtime overlay for every printer
transport registered by the current MakerSpell application.

It records:

- adapter resolution order and support level;
- discovery service types, ports, protocols, authentication, and probe evidence;
- baseline and conditional capabilities;
- optional runtime contracts implemented by each adapter;
- UI sections, job controls, device controls, and print preparation options;
- the application source file that implements each adapter.

MakerSpell verifies it through the SHA-256 digest in
`catalog/runtime-v1.json`. It may select and restrict compiled behavior, but it
cannot introduce executable code or widen the installed adapter's abilities.
Do not edit the generated registry without updating its catalog digest and
proposing any matching application/exporter changes.
