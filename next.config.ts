import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: path.resolve(__dirname), // Sets the root to the directory containing next.config.js
  },
};

export default nextConfig;
