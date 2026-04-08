import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "入会申込",
  description: "全日本カイロプラクティック施術協同組合への入会をオンラインでお申し込みいただけます。",
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
