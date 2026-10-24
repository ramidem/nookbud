import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

/** On these hosts the well-known Supabase dev database password is not a secret. */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0', 'host.docker.internal']);

/** Passwords in docs and templates that are placeholders, not credentials. */
const PLACEHOLDER = /^(\[?your[-_ ]?password\]?|<.*>|\*+|password|changeme)$/i;

/**
 * Names that must never reach a client. Each is also tried with the NEXT_PUBLIC_ prefix, because
 * that prefix is how a secret gets copied into the browser bundle by mistake.
 */
export const CANARY_BASE_NAMES = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_DB_PASSWORD',
  'DATABASE_PASSWORD',
  'SERVICE_ROLE_KEY',
];
export const CANARY_PREFIXES = ['', 'NEXT_PUBLIC_'];

/** Decoy values for those names. If one shows up in client output, something read a secret. */
export function canaryEnvironment(random = () => crypto.randomBytes(8).toString('hex')) {
  const env = {};
  for (const prefix of CANARY_PREFIXES) {
    for (const base of CANARY_BASE_NAMES) {
      const name = `${prefix}${base}`;
      env[name] = `nookbud-canary-${name.toLowerCase().replaceAll('_', '-')}-${random()}`;
    }
  }
  return env;
}

export function redact(value) {
  return value.length <= 8 ? '****' : `${value.slice(0, 6)}…(${value.length} chars)`;
}

function jwtRole(token) {
  try {
    const payload = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/');
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf8')).role;
  } catch {
    return undefined;
  }
}

const RULES = [
  { rule: 'supabase-secret-key', pattern: /sb_secret_[A-Za-z0-9_-]{16,}/g },
  { rule: 'supabase-access-token', pattern: /sbp_[a-f0-9]{40}/g },
  { rule: 'google-oauth-client-secret', pattern: /GOCSPX-[A-Za-z0-9_-]{20,}/g },
  { rule: 'private-key', pattern: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/g },
  { rule: 'aws-access-key-id', pattern: /AKIA[0-9A-Z]{16}/g },
  { rule: 'github-token', pattern: /gh[pousr]_[A-Za-z0-9]{36,}/g },
  { rule: 'slack-token', pattern: /xox[baprs]-[A-Za-z0-9-]{10,}/g },
];

/**
 * Look for secrets in text a browser could receive.
 * `canaries` maps an environment variable name to its decoy value.
 * Returns findings with the value redacted, never the value itself.
 */
export function findSecrets(text, canaries = {}) {
  const findings = [];

  for (const [name, value] of Object.entries(canaries)) {
    if (text.includes(value)) findings.push({ rule: `canary:${name}`, excerpt: redact(value) });
  }

  for (const { rule, pattern } of RULES) {
    for (const match of text.matchAll(pattern)) findings.push({ rule, excerpt: redact(match[0]) });
  }

  // A Supabase anon key is a JWT too and is meant to be public. Only the service role is a secret.
  for (const match of text.matchAll(
    /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  )) {
    const role = jwtRole(match[0]);
    if (role === 'service_role' || role === 'supabase_admin') {
      findings.push({ rule: 'supabase-service-role-jwt', excerpt: redact(match[0]) });
    }
  }

  for (const match of text.matchAll(
    /postgres(?:ql)?:\/\/([^\s:@/'"]+):([^\s@/'"]+)@([^\s/:?'"]+)/g,
  )) {
    const [whole, , password, host] = match;
    if (!LOCAL_HOSTS.has(host) && !PLACEHOLDER.test(password)) {
      findings.push({ rule: 'database-url-with-password', excerpt: redact(whole) });
    }
  }

  return findings;
}
