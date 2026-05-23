import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["openai", "@anthropic-ai/sdk"],
  async headers() {
    return [
      {
        // Permissions-Policy lets the browser know mic is used;
        // HSTS enforces HTTPS so getUserMedia isn't blocked on mobile.
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "microphone=*",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
