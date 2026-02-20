import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "好運大師 - 古籍智慧 × AI 命理",
  description: "融合《窮通寶鑑》、《滴天髓》、《紫微斗數大全》等 18 部命理經典，結合 AI 科技為您解讀八字與紫微命盤",
  keywords: "八字, 紫微斗數, 算命, 命理, AI, 窮通寶鑑, 滴天髓, 好運大師",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "好運大師",
  },
  openGraph: {
    title: "好運大師 - 古籍智慧 × AI 命理",
    description: "融合千年古籍智慧，以 AI 科技為您解讀命盤",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
