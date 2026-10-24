//@ts-check
const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A self-contained server for the container. In a monorepo, tracing has to start at the repo root
  // so the workspace's packages are included in the output.
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

module.exports = nextConfig;
