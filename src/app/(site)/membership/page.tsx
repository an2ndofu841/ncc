import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "入会案内",
  description:
    "全日本カイロプラクティック施術協同組合への入会の流れ、メリット、お申込みについてご案内します。",
};

const STEPS = [
  {
    step: 1,
    title: "資料のご確認",
    body: "会員種別・会費、活動内容、規約類をご覧いただき、ご不明点はお問い合わせください。",
  },
  {
    step: 2,
    title: "お申込み",
    body: "所定の入会申込フォームより必要事項をご入力のうえ、お申し込みください。",
  },
  {
    step: 3,
    title: "審査・書類手続",
    body: "事務局にて内容を確認のうえ、必要に応じてご連絡いたします。所定の書類をご提出ください。",
  },
  {
    step: 4,
    title: "入会確定・会員サービス開始",
    body: "手続完了後、会員証の発行および会員向け情報のご案内を行います。",
  },
];

const MERITS = [
  "組合認定による信頼性の向上と広報での活用",
  "定期研修・セミナーへの優先参加",
  "会員限定の情報共有と相談サポート",
  "全国の加盟ネットワークとの連携機会",
  "協同組合としての相互扶助の枠組み",
];

export default function MembershipPage() {
  return (
    <>
      <PageHeader
        title="入会案内"
        description="当組合への入会方法、メリット、お申込みについてご案内します。"
        breadcrumbs={[{ label: "入会案内" }]}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section>
          <h2 className="text-xl font-bold text-primary-700 sm:text-2xl">
            入会の流れ
          </h2>
          <ol className="mt-8 space-y-6">
            {STEPS.map((s, i) => (
              <li key={s.step} className="relative flex gap-4 sm:gap-6">
                <div className="flex shrink-0 flex-col items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {s.step}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span
                      className="mt-2 w-px flex-1 min-h-[2rem] bg-primary-200"
                      aria-hidden
                    />
                  )}
                </div>
                <Card className="flex-1 border-primary-100">
                  <h3 className="font-bold text-neutral-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {s.body}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-bold text-primary-700 sm:text-2xl">
            入会のメリット
          </h2>
          <Card className="mt-8 border-accent/40 bg-gradient-to-br from-primary-50 to-white">
            <ul className="space-y-3">
              {MERITS.map((m) => (
                <li key={m} className="flex gap-3 text-sm text-neutral-700">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                    strokeWidth={1.75}
                  />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="mt-16 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center sm:p-10">
          <h2 className="text-lg font-bold text-primary-700 sm:text-xl">
            お申込み・お問い合わせ
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-600">
            会員種別・会費の詳細は「会員種別・会費案内」をご確認のうえ、下記よりお申し込みください。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/membership-types"
              className="inline-flex w-full items-center justify-center rounded-lg border-2 border-primary bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-50 sm:w-auto"
            >
              会員種別・会費を見る
            </Link>
            <Link
              href="/apply"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-light sm:w-auto"
            >
              入会申込フォームへ
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
