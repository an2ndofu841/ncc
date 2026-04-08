import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "全日本カイロプラクティック施術協同組合へのお問い合わせフォームです。ご質問・ご相談をお気軽にお寄せください。",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
