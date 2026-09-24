import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",         // Enables static HTML export
  images: {
    unoptimized: true,      // Required for static export (no server for image optimization)
  },
};

export default nextConfig;
