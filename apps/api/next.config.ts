import type { NextConfig } from "next";

require('dotenv').config({ path: '../../.env' });

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
