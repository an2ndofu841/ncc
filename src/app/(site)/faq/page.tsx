import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import FaqAccordion from "./FaqAccordion";

export const metadata: Metadata = {
  title: "よくある質問",
  description:
    "入会、会費、認定、研修、個人情報など、全日本カイロプラクティック施術協同組合に関するよくあるご質問です。",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        title="よくある質問"
        description="会員の皆様・ご検討中の方からよくお寄せいただく質問をまとめました。"
        breadcrumbs={[{ label: "よくある質問" }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <FaqAccordion />
        <p className="mt-8 text-center text-sm text-neutral-500">
          解決しない場合は、
          <Link
            href="/contact"
            className="font-medium text-primary hover:underline"
          >
            お問い合わせ
          </Link>
          よりご連絡ください。
        </p>
      </div>
    </>
  );
}
