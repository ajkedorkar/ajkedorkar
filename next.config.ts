import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.43.113.225", "localhost"],
  transpilePackages: ['tailwindcss'],
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;