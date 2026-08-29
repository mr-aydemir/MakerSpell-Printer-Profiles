# Built-in adapter reference

`registry-v1.json` is a generated, review-only snapshot of every printer
transport registered by the current MakerSpell application.

It records:

- adapter resolution order and support level;
- discovery service types, ports, protocols, authentication, and probe evidence;
- baseline and conditional capabilities;
- optional runtime contracts implemented by each adapter;
- UI sections, job controls, device controls, and print preparation options;
- the application source file that implements each adapter.

Do not edit the generated snapshot without also proposing the corresponding
application or exporter change. Community overrides belong in
`community/profiles/` and enter production only through the pinned catalog.
