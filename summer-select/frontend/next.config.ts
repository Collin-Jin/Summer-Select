import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent Next from accidentally picking a different workspace root
    // (e.g. due to multiple lockfiles on the machine), which can slow down dev.
    root: __dirname,
  },
  async redirects() {
    return [
      // The old pay-wall page is now the public landing page.
      { source: "/paywall", destination: "/", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
