import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  // PWA / SW only in production builds (Turbopack dev doesn't support webpack plugin)
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Silence "webpack config with Turbopack" warning — Serwist registers a
  // webpack hook even when disabled. Empty turbopack config opts in explicitly.
  turbopack: {},
};

export default withSerwist(nextConfig);
