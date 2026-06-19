import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // DiceBear avatar SVGs (fallback when no custom avatar is set).
      { protocol: "https", hostname: "api.dicebear.com" },
      // Supabase Storage (user-uploaded avatars).
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
};

export default nextConfig;
