import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production builds within the memory budget of the shared VPS.
  experimental: { cpus: 1 },
  // Historical developer smoke scripts are checked separately from the app.
  typescript: { tsconfigPath: "tsconfig.build.json" },
  // C-team-brief-n-indicator — hide Next.js DevTools bottom-left «N»
  devIndicators: false,
};

export default nextConfig;
