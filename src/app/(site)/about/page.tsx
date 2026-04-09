import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "組合概要",
  description:
    "全日本カイロプラクティック施術協同組合の名称、目的、所在地、連絡先などの基本情報をご案内します。",
};

const INFO_ROWS = [
  { label: "名称", value: "全日本カイロプラクティック施術協同組合" },
  {
    label: "目的",
    value:
      "カイロプラクティック施術者の専門性の向上、相互扶助、および業界の健全な発展と社会への貢献を図ること。",
  },
  { label: "設立", value: "1999年3月10日" },
  {
    label: "所在地",
    value: "〒210-0007 神奈川県川崎市川崎区駅前本町11-2 川崎フロンティアビル12階 A-2",
  },
  {
    label: "電話",
    value: "070-9047-7924",
  },
  { label: "FAX", value: "—" },
  {
    label: "メール",
    value: "info@ncc-chiro.or.jp（お問い合わせはフォームもご利用いただけます）",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="組合概要"
        description="当組合の名称・目的・所在地など、基本情報をご案内します。"
        breadcrumbs={[{ label: "組合概要" }]}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-lg font-bold text-primary-700">
                組合の名称と目的
              </h2>
              <dl className="mt-6 space-y-4">
                <div className="border-b border-neutral-100 pb-4">
                  <dt className="text-sm font-semibold text-neutral-500">
                    名称
                  </dt>
                  <dd className="mt-1 text-neutral-800">
                    全日本カイロプラクティック施術協同組合
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-neutral-500">
                    目的
                  </dt>
                  <dd className="mt-1 leading-relaxed text-neutral-700">
                    当組合は、カイロプラクティック施術に従事する者の技術・知識の向上、倫理の涵養、会員相互の連携と扶助を通じて、利用者に安心・安全な施術環境の提供に寄与し、もって業界の健全な発展と社会福祉の増進に貢献することを目的とします。
                  </dd>
                </div>
              </dl>
            </Card>
            <Card>
              <h2 className="text-lg font-bold text-primary-700">
                沿革・組織（概要）
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                全国各地の施術者・施設が参画する協同組合として、理事会・委員会等の体制のもと、認定制度、研修、広報、外部団体との連携などを運営しています。詳細はお問い合わせください。
              </p>
            </Card>
          </div>
          <div>
            <Card className="bg-primary-50/80 border-primary-100">
              <h2 className="text-lg font-bold text-primary-700">
                基本情報一覧
              </h2>
              <ul className="mt-4 space-y-4 text-sm">
                {INFO_ROWS.map((row) => (
                  <li key={row.label}>
                    <p className="font-semibold text-neutral-500">{row.label}</p>
                    <p className="mt-1 text-neutral-800 leading-relaxed">
                      {row.value}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
