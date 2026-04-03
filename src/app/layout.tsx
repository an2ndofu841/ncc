import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "全日本カイロプラクティック施術協同組合",
    template: "%s | 全日本カイロプラクティック施術協同組合",
  },
  description:
    "全日本カイロプラクティック施術協同組合の公式サイトです。カイロプラクティック施術者の地位向上と業界の健全な発展を目指しています。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
