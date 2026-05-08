import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // experimental এর ভেতর থেকে বের করে সরাসরি এখানে দিন
  allowedDevOrigins: ["10.220.15.225", "localhost"], 
  
  transpilePackages: ['tailwindcss'],
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;