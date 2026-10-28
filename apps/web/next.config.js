//@ts-check
const path = require('node:path');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Sent with every response (R17). The browser never talks to Supabase directly, so scripts,
 * connections and frames stay on this site. Inline scripts are allowed because Next.js needs them
 * to start the page; move to a nonce if a page ever renders user-supplied HTML.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? ' ws:' : ''}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // Email links carry one-time tokens; never pass the full address on to another site.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(isDev
    ? []
    : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A self-contained server for the container. In a monorepo, tracing has to start at the repo root
  // so the workspace's packages are included in the output.
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  poweredByHeader: false,
  async headers() {
    return [{ headers: securityHeaders, source: '/:path*' }];
  },
  // Short addresses for the policies, which live in the public documentation.
  async redirects() {
    return [
      { destination: '/documentation/legal/terms', permanent: false, source: '/terms' },
      { destination: '/documentation/legal/privacy', permanent: false, source: '/privacy' },
    ];
  },
};

module.exports = nextConfig;
