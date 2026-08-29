import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const roots = [
  'profiles',
  'community/profiles',
  'community/schema',
  'built-in',
  'schema',
];
let files = 0;
for (const root of roots) {
  if (!fs.existsSync(root)) throw new Error(`Missing required directory: ${root}`);
  for (const file of walk(root)) {
    if (!file.endsWith('.json')) continue;
    JSON.parse(fs.readFileSync(file, 'utf8'));
    files += 1;
  }
}
if (files === 0) throw new Error('No JSON profiles found');
const profileSchema = JSON.parse(
  fs.readFileSync('community/schema/profile.schema.json', 'utf8'),
);
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateProfile = ajv.compile(profileSchema);
for (const file of walk('community/profiles')) {
  if (!file.endsWith('.json')) continue;
  const profile = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!validateProfile(profile)) {
    throw new Error(
      `${file} failed profile schema validation:\n${ajv.errorsText(
        validateProfile.errors,
        { separator: '\n' },
      )}`,
    );
  }
}
const catalogSchema = JSON.parse(
  fs.readFileSync('community/schema/catalog.schema.json', 'utf8'),
);
const validateCatalog = ajv.compile(catalogSchema);
const catalog = JSON.parse(
  fs.readFileSync('catalog/community-v1.json', 'utf8'),
);
if (!validateCatalog(catalog)) {
  throw new Error(
    `catalog/community-v1.json failed schema validation:\n${ajv.errorsText(
      validateCatalog.errors,
      { separator: '\n' },
    )}`,
  );
}
const builtInSchema = JSON.parse(
  fs.readFileSync('schema/builtin-registry.schema.json', 'utf8'),
);
const validateBuiltIn = ajv.compile(builtInSchema);
const builtIn = JSON.parse(
  fs.readFileSync('built-in/registry-v1.json', 'utf8'),
);
if (!validateBuiltIn(builtIn)) {
  throw new Error(
    `built-in/registry-v1.json failed schema validation:\n${ajv.errorsText(
      validateBuiltIn.errors,
      { separator: '\n' },
    )}`,
  );
}
console.log(`Validated ${files} JSON files.`);

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(resolved);
    else if (entry.isFile()) yield resolved;
  }
}
