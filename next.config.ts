import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Material uploads go through a Server Function; the backend accepts files up to 25 MB (FR-G-030).
    serverActions: { bodySizeLimit: "26mb" },
  },
};

export default nextConfig;
