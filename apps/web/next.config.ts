import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  distDir: 'out',

  output: 'export',
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
