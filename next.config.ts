import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Mantém a compilação de produção separada do servidor local. Isso evita
  // corrupção do cache quando `next build` é executado com `next dev` aberto.
  distDir: process.env.VERCEL || process.env.NETLIFY
    ? ".next"
    : process.env.NODE_ENV === "production"
      ? ".next-prod"
      : ".next-dev",
};

export default nextConfig;
