import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "news.bbcimg.co.uk",
      },
      {
        protocol: "https",
        hostname: "static01.nyt.com",
      },
      {
        protocol: "https",
        hostname: "assets.guim.co.uk",
      },
      {
        protocol: "https",
        hostname: "www.aljazeera.com",
      },
      {
        protocol: "https",
        hostname: "www.thehindu.com",
      },
      {
        protocol: "https",
        hostname: "indianexpress.com",
      },
      {
        protocol: "https",
        hostname: "drop.ndtv.com",
      },
      {
        protocol: "https",
        hostname: "static.toiimg.com",
      },
      {
        protocol: "https",
        hostname: "www.hindustantimes.com",
      },
    ],
  },
};

export default nextConfig;
