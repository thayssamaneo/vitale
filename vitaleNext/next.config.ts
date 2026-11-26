import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    // Define a raiz do workspace para evitar conflito com lockfiles externos
    root: __dirname,
  },
};

export default nextConfig;
