import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/runs",
        destination: "/app/runs",
        permanent: false,
      },
      {
        source: "/runs/:path*",
        destination: "/app/runs/:path*",
        permanent: false,
      },
      {
        source: "/agents",
        destination: "/app/agents",
        permanent: false,
      },
      {
        source: "/analytics",
        destination: "/app/analytics",
        permanent: false,
      },
      {
        source: "/detections",
        destination: "/app/detections",
        permanent: false,
      },
      {
        source: "/compare",
        destination: "/app/compare",
        permanent: false,
      },
      {
        source: "/settings",
        destination: "/app/settings",
        permanent: false,
      },
      {
        source: "/settings/:path*",
        destination: "/app/settings/:path*",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/app/login",
        permanent: false,
      },
      {
        source: "/traces",
        destination: "/app/traces",
        permanent: false,
      },
      {
        source: "/paths/:path*",
        destination: "/app/paths/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const appTarget = process.env.PATHFLOW_APP_TARGET_URL || "https://thepathflow.vercel.app";
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
