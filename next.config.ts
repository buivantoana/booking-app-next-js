// next.config.js
const withNextIntl = require('next-intl/plugin')(
  './next-intl.config.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  }
};

module.exports = withNextIntl(nextConfig);
