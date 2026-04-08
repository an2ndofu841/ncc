import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "検索",
  description: "全日本カイロプラクティック施術協同組合サイト内のコンテンツを検索できます。",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
