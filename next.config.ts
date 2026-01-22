// next.config.js
const withNextIntl = require('next-intl/plugin')(
  './next-intl.config.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Tạm tắt Strict Mode
  typescript: {
    // ⚠️ CẢNH BÁO: Tắt hoàn toàn TypeScript checking
    ignoreBuildErrors: true,
  },
  eslint: {
    // Tắt cả ESLint nếu cần
    ignoreDuringBuilds: true,
  },
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
