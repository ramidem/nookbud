//@ts-check
const { composePlugins, withNx } = require('@nx/next');

const nextConfig = {
  nx: {},
  output: 'standalone',
  transpilePackages: ['@coparent/ui'],
};

const plugins = [withNx];
module.exports = composePlugins(...plugins)(nextConfig);
