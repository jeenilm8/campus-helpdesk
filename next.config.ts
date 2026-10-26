import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@helpdesk/runtime": process.env.VERCEL === "1" || process.env.HELPDESK_BUILD_TARGET === "vercel"
        ? "./lib/vercel-runtime.ts" : "./lib/worker-runtime.ts",
    },
  },
};

export default nextConfig;
