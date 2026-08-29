import fs from 'node:fs';
import path from 'node:path';

const roots = ['profiles', 'community/profiles', 'community/schema'];
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
console.log(`Validated ${files} JSON files.`);

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(resolved);
    else if (entry.isFile()) yield resolved;
  }
}

