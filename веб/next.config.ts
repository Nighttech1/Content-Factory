import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // C-team-brief-n-indicator — hide Next.js DevTools bottom-left «N»
  devIndicators: false,
  // Деплой на VPS: самодостаточный сервер (минимум node_modules) — сборка на раннере, запуск на VPS.
  output: "standalone",
};

export default nextConfig;
