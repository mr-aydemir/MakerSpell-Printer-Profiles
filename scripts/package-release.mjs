import crypto from 'node:crypto';
import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version ?? '')) {
  throw new Error('Usage: node scripts/package-release.mjs <semver>');
}
fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist', { recursive: true });
childProcess.execFileSync('zip', ['-q', '-r', 'dist/profiles.zip', 'profiles']);
const archive = fs.readFileSync('dist/profiles.zip');
const capabilityPath = path.join(
  'profiles',
  'metadata',
  'profiles-capabilities.json',
);
const capability = fs.readFileSync(capabilityPath);
const capabilityDocument = JSON.parse(capability.toString('utf8'));
const tag = `profiles-v${version}`;
const base = `https://github.com/mr-aydemir/MakerSpell-Printer-Profiles/releases/download/${tag}`;
const manifest = {
  version,
  downloadUrl: `${base}/profiles.zip`,
  sha256: crypto.createHash('sha256').update(archive).digest('hex'),
  size: archive.length,
  capabilities: {
    version: capabilityDocument.version,
    archivePath: capabilityPath.replaceAll('\\', '/'),
    sha256: crypto.createHash('sha256').update(capability).digest('hex'),
    size: capability.length,
  },
  releasedAt: new Date().toISOString(),
};
fs.writeFileSync(
  'dist/profiles-manifest.json',
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`Packaged ${archive.length} bytes for ${tag}.`);
