import type { NextConfig } from "next";

const apiBase = process.env.HACKATHON_API_URL ?? "https://hackathon.epignosishq.com";

const nextConfig: NextConfig = {
  serverExternalPackages: ["openai", "@anthropic-ai/sdk"],
  async rewrites() {
    return [
      {
        source: "/mock-api/:path*",
        destination: `${apiBase}/mock-api/:path*`,
      }
    ]
  },
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
