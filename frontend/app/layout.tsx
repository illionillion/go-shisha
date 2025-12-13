import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "../components/Header";
import "./globals.css";
import { AppProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "シーシャ行こう - シーシャSNS",
  description: "シーシャ好きのためのSNSアプリ。投稿を共有して、新しいお店や味を発見しよう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <AppProvider>
          <Header />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
