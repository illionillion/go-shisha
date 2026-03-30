import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
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
      // TODO: モックデータ用。本番では実際の画像ホストに置き換える
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
    ],
    // 開発環境でlocalhostへのアクセスを許可（SSRF保護を無効化）
    unoptimized: process.env.NODE_ENV === "development",
  },
  // バックエンドAPIをプロキシして同一オリジン化（Cookie問題の解決）
  // /images/:path* も BACKEND_URL に転送することで、next/image の SSRF 制限を回避する
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/images/:path*",
        destination: `${backendUrl}/images/:path*`,
      },
    ];
  },
};

export default nextConfig;
