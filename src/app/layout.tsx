import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Map Marker - 地図マーキングアプリ",
  description: "Google Mapに場所をマークしてコメントを追加できるアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
