//@ts-check
const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A self-contained server for the container. In a monorepo, tracing has to start at the repo root
  // so the workspace's packages are included in the output.
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Short addresses for the policies, which live in the public documentation.
  async redirects() {
    return [
      { destination: '/documentation/legal/terms', permanent: false, source: '/terms' },
      { destination: '/documentation/legal/privacy', permanent: false, source: '/privacy' },
    ];
  },
};

module.exports = nextConfig;
