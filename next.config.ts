import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Material uploads go through a Server Function; the backend accepts files up to 25 MB (FR-G-030).
    serverActions: { bodySizeLimit: "26mb" },
  },
  // The tab icon is app/icon.svg; browsers that still ask for /favicon.ico get the same logo.
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/icon.svg", permanent: true }];
  },
};

export default nextConfig;
