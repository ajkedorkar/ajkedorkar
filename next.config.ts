import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // experimental এর ভেতর থেকে বের করে সরাসরি এখানে দিন
  allowedDevOrigins: ["10.220.15.225", "localhost"], 
  
  transpilePackages: ['tailwindcss'],
  trailingSlash: false,
  skipTrailingSlashRedirect: true,

  // ✅ ইমেজ অপটিমাইজেশন - WebP/AVIF সাপোর্ট
  images: {
    formats: ['image/avif', 'image/webp'],  // AVIF (আরও ভালো) + WebP
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,  // 60 সেকেন্ড ক্যাশ
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',  // সব HTTPS URL অনুমোদিত (প্রোডাকশনের জন্য নির্দিষ্ট দিন)
      },
      {
        protocol: 'http',
        hostname: 'localhost',  // লোকাল ডেভেলপমেন্ট
      },
    ],
  },

  // ✅ কম্প্রেশন অন (gzip + brotli)
  compress: true,

  // ✅ পাওয়ার সেভিং মোড অফ (স্পিড বুস্ট)
  poweredByHeader: false,
};

export default nextConfig;