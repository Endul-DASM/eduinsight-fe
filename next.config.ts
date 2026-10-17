import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Built in GitHub Actions; the VM only runs .next/standalone/server.js.
  output: "standalone",
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
