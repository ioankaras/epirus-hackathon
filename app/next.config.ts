import type { NextConfig } from "next";

const apiBase = process.env.HACKATHON_API_URL ?? "https://hackathon.epignosishq.com";

const nextConfig: NextConfig = {
  serverExternalPackages: ["openai", "@anthropic-ai/sdk"],
  async rewrites() {
    return [
      {
        source: "/mock-api/:path*",
        destination: `${apiBase}/mock-api/:path*`,
      },
    ];
  },
};

export default nextConfig;
