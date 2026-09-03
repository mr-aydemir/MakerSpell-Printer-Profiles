import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const profilesDirectory = 'community/profiles';
const catalogPath = 'catalog/community-v1.json';
const files = fs
  .readdirSync(profilesDirectory)
  .filter((name) => name.endsWith('.json'))
  .sort();

const profiles = files.map((name) => {
  const body = Buffer.from(
    fs
      .readFileSync(path.join(profilesDirectory, name), 'utf8')
      .replace(/\r\n/g, '\n'),
    'utf8',
  );
  return {
    url: `../community/profiles/${name}`,
    sha256: crypto.createHash('sha256').update(body).digest('hex'),
  };
});

fs.writeFileSync(
  catalogPath,
  `${JSON.stringify({ schemaVersion: 1, profiles }, null, 2)}\n`,
);
