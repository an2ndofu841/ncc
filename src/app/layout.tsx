import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ncc-chiro.or.jp";
const SITE_NAME = "全日本カイロプラクティック施術協同組合";
const DEFAULT_DESCRIPTION =
  "全日本カイロプラクティック施術協同組合の公式サイトです。カイロプラクティック施術者の地位向上と業界の健全な発展を目指しています。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "https://hhehvcdwzorzfxsulxqm.supabase.co/storage/v1/object/public/uploads/fav.png",
    apple:
      "https://hhehvcdwzorzfxsulxqm.supabase.co/storage/v1/object/public/uploads/fav.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
