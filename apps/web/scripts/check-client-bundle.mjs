// Builds the web app with decoy secrets in the environment, then fails if a decoy, or anything that
// looks like a real key, appears in a file a browser can receive. Run it with: pnpm nx run web:check-secrets
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { canaryEnvironment, findSecrets } from './secret-patterns.mjs';

const webRoot = path.resolve(import.meta.dirname, '..');

// Files Next.js sends to browsers: client chunks, the pre-rendered pages and their data, and /public.
const CLIENT_OUTPUT = ['.next/static', '.next/server/app', 'public'];
const SKIP_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
]);

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (!SKIP_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) yield full;
  }
}

const canaries = canaryEnvironment();

console.log(`Building with ${Object.keys(canaries).length} decoy secrets in the environment...`);
const build = spawnSync('pnpm', ['exec', 'next', 'build'], {
  cwd: webRoot,
  env: { ...process.env, ...canaries },
  stdio: 'inherit',
});
if (build.status !== 0) {
  console.error('The build failed, so the bundle could not be checked.');
  process.exit(build.status ?? 1);
}

let scanned = 0;
const problems = [];
for (const root of CLIENT_OUTPUT) {
  for (const file of walk(path.join(webRoot, root))) {
    scanned += 1;
    for (const finding of findSecrets(fs.readFileSync(file, 'utf8'), canaries)) {
      problems.push(`${path.relative(webRoot, file)}: ${finding.rule} (${finding.excerpt})`);
    }
  }
}

if (scanned === 0) {
  console.error('No client output was found to check. The check is not working.');
  process.exit(1);
}
if (problems.length > 0) {
  console.error(
    `\nSecrets found in files a browser can receive:\n${problems.map((p) => `  ${p}`).join('\n')}`,
  );
  console.error(
    '\nSee docs/secrets.md. A secret must never be read by client code or prefixed NEXT_PUBLIC_.',
  );
  process.exit(1);
}
console.log(`OK: no secrets in ${scanned} client-visible files.`);
