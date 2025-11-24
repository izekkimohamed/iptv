import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/trpc/:path*",
        destination: `${process.env.TRPC_URL}/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL}/api/:path*`,
      },
    ];
  },
  maxDuration: 300,
};

export default nextConfig;
