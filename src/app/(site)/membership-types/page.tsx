import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Check } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "会員種別・会費案内",
  description:
    "正会員・準会員・家族会員・学生会員の会費・入会金および特典をご案内します。",
};

const TYPES = [
  {
    name: "正会員",
    badge: "経営者向け",
    admission: "100,000円",
    certification: "50,000円",
    annual: "30,000円",
    highlight: true,
    benefits: [
      "勉強会・研修会・特別講義の受講料が30%割引",
      "海外研修の参加費が30%割引",
      "組合認定証の交付",
      "組合公認プレートの発行",
      "組合主催の行事への参加資格",
      "組合バッジの交付",
      "医療消耗品を10〜40%割引で購入可能",
    ],
  },
  {
    name: "準会員",
    badge: "スタッフ向け",
    admission: "50,000円",
    certification: null,
    annual: "20,000円",
    highlight: false,
    benefits: [
      "組合認定証の交付",
      "勉強会・研修会・特別講義の受講料が20%割引",
      "海外研修の参加費が20%割引",
      "組合主催の行事への参加資格",
    ],
  },
  {
    name: "家族会員",
    badge: "ご家族向け",
    admission: "40,000円",
    certification: null,
    annual: "10,000円",
    highlight: false,
    benefits: [
      "組合主催の行事への参加資格",
      "勉強会・研修会・特別講義の受講料が20%割引",
      "海外研修の参加費が20%割引",
      "組合証の発行",
    ],
  },
  {
    name: "学生会員",
    badge: "在学生向け",
    admission: "30,000円",
    certification: null,
    annual: "10,000円",
    highlight: false,
    benefits: [
      "各種研修の受講料が15%割引",
    ],
  },
];

export default function MembershipTypesPage() {
  return (
    <>
      <PageHeader
        title="会員種別・会費案内"
        description="各会員区分の入会金・年会費と特典のご案内です。"
        breadcrumbs={[{ label: "会員種別・会費案内" }]}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* テーブル */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-primary-50">
                <th className="px-4 py-3 font-semibold text-primary-700 sm:px-6">
                  会員種別
                </th>
                <th className="px-4 py-3 font-semibold text-primary-700 sm:px-6">
                  入会金
                </th>
                <th className="hidden px-4 py-3 font-semibold text-primary-700 sm:table-cell sm:px-6">
                  認定料
                </th>
                <th className="px-4 py-3 font-semibold text-primary-700 sm:px-6">
                  年会費
                </th>
              </tr>
            </thead>
            <tbody>
              {TYPES.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <td className="px-4 py-4 align-top sm:px-6">
                    <span className="font-bold text-neutral-900">
                      {row.name}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top tabular-nums text-neutral-800 sm:px-6">
                    {row.admission}
                  </td>
                  <td className="hidden px-4 py-4 align-top tabular-nums text-neutral-800 sm:table-cell sm:px-6">
                    {row.certification ?? "—"}
                  </td>
                  <td className="px-4 py-4 align-top tabular-nums font-medium text-primary sm:px-6">
                    {row.annual}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          ※金額は税込です。最新の金額は入会案内書をご確認ください。
        </p>

        {/* カード */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {TYPES.map((t) => (
            <Card
              key={t.name}
              className={
                t.highlight
                  ? "ring-2 ring-accent/60 border-accent/30 relative"
                  : "border-neutral-200"
              }
            >
              {t.highlight && (
                <div className="absolute -top-3 right-4">
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow">
                    {t.badge}
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-primary-700">
                  {t.name}
                </h2>
                {!t.highlight && (
                  <Badge className="shrink-0 border border-accent/50 bg-accent/10 text-accent-dark">
                    {t.badge}
                  </Badge>
                )}
              </div>

              <dl className="mt-4 grid gap-3 text-sm" style={{ gridTemplateColumns: t.certification ? "1fr 1fr 1fr" : "1fr 1fr" }}>
                <div className="rounded-lg bg-neutral-50 px-3 py-2">
                  <dt className="text-xs text-neutral-500">入会金</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-neutral-900">
                    {t.admission}
                  </dd>
                </div>
                {t.certification && (
                  <div className="rounded-lg bg-neutral-50 px-3 py-2">
                    <dt className="text-xs text-neutral-500">認定料</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums text-neutral-900">
                      {t.certification}
                    </dd>
                  </div>
                )}
                <div className="rounded-lg bg-primary-50 px-3 py-2">
                  <dt className="text-xs text-primary-600">年会費</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-primary">
                    {t.annual}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-neutral-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  特典
                </p>
                <ul className="mt-2 space-y-2">
                  {t.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-neutral-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/apply"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-8 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-accent-light"
          >
            入会申込みはこちら
          </Link>
        </div>
      </div>
    </>
  );
}
