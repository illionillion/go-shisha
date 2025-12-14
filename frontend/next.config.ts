import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "*.app.github.dev",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      // TODO: 本番環境用の画像ホストをここに追加する
    ],
    // 開発環境でlocalhostへのアクセスを許可（SSRF保護を無効化）
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
