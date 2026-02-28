import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/middle-east-tracker" : "";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  output: "export",
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
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
