import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "会員種別・会費案内",
  description:
    "正会員・準会員・学生会員・賛助会員の会費・入会金および概要をご案内します。",
};

const TYPES = [
  {
    name: "正会員",
    badge: "施術者向け",
    desc: "カイロプラクティック施術の実務に従事する方を対象とした会員区分です。",
    admission: "30,000円",
    annual: "36,000円",
    highlight: true,
  },
  {
    name: "準会員",
    badge: "施術者向け",
    desc: "一定の条件を満たす施術関連の従事者向けの区分です（※詳細は規約をご確認ください）。",
    admission: "20,000円",
    annual: "24,000円",
    highlight: false,
  },
  {
    name: "学生会員",
    badge: "在学生",
    desc: "関連分野の教育機関に在学中の方を対象とした区分です。",
    admission: "無料",
    annual: "12,000円",
    highlight: false,
  },
  {
    name: "賛助会員",
    badge: "法人・団体",
    desc: "当組合の理念に賛同する法人・団体等の区分です。",
    admission: "10,000円",
    annual: "24,000円",
    highlight: false,
  },
];

export default function MembershipTypesPage() {
  return (
    <>
      <PageHeader
        title="会員種別・会費案内"
        description="各会員区分の入会金・年会費の目安です。最新の金額は申込時の案内をご確認ください。"
        breadcrumbs={[{ label: "会員種別・会費案内" }]}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-primary-50">
                <th className="px-4 py-3 font-semibold text-primary-700 sm:px-6">
                  会員種別
                </th>
                <th className="hidden px-4 py-3 font-semibold text-primary-700 sm:table-cell sm:px-6">
                  概要
                </th>
                <th className="px-4 py-3 font-semibold text-primary-700 sm:px-6">
                  入会金
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
                    <span className="font-bold text-neutral-900">{row.name}</span>
                  </td>
                  <td className="hidden max-w-xs px-4 py-4 align-top text-neutral-600 sm:table-cell sm:px-6">
                    {row.desc}
                  </td>
                  <td className="px-4 py-4 align-top tabular-nums text-neutral-800 sm:px-6">
                    {row.admission}
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
          ※消費税の扱い・支払方法は入会案内書に準じます。表示は例示であり、改定される場合があります。
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {TYPES.map((t) => (
            <Card
              key={t.name}
              className={
                t.highlight
                  ? "ring-2 ring-accent/60 border-accent/30"
                  : "border-neutral-200"
              }
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-primary-700">{t.name}</h2>
                <Badge className="shrink-0 border border-accent/50 bg-accent/10 text-accent-dark">
                  {t.badge}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-neutral-600 sm:hidden">{t.desc}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-neutral-50 px-3 py-2">
                  <dt className="text-xs text-neutral-500">入会金</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-neutral-900">
                    {t.admission}
                  </dd>
                </div>
                <div className="rounded-lg bg-primary-50 px-3 py-2">
                  <dt className="text-xs text-primary-600">年会費</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-primary">
                    {t.annual}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 hidden text-sm text-neutral-600 sm:block">
                {t.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
