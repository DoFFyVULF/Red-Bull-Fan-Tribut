import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root so it doesn't infer it from stray
  // lockfiles outside the repo (e.g. ~/package-lock.json).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
