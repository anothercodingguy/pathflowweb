import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const appTarget = process.env.PATHFLOW_APP_TARGET_URL || "https://pathflow-psi.vercel.app";
    return [
      {
        source: "/app",
        destination: `${appTarget}/app`,
      },
      {
        source: "/app/:path*",
        destination: `${appTarget}/app/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${appTarget}/app/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
