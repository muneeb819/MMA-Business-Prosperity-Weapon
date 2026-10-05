import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Production on Vercel routes /api through vercel.json to the Python function.
    // Local Next.js and container builds proxy server-side so browser requests stay same-origin.
    if (process.env.VERCEL || process.env.VERCEL_ENV) return [];

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8001";
    if (process.env.NODE_ENV === "development" || process.env.BACKEND_URL) {
      return [
        { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
        { source: "/health", destination: `${backendUrl}/health` },
      ];
    }

    return [];
  },
};

export default nextConfig;
