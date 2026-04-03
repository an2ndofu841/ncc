import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "利用規約",
  description:
    "全日本カイロプラクティック施術協同組合の公式ウェブサイトの利用条件について定めます。",
};

const SECTIONS = [
  {
    title: "第1条（適用）",
    body: "本規約は、全日本カイロプラクティック施術協同組合（以下「当組合」といいます。）が運営するウェブサイト（以下「本サイト」といいます。）の利用条件を定めるものです。利用者は本規約に同意のうえ本サイトを利用するものとします。",
  },
  {
    title: "第2条（利用上の注意）",
    body: "利用者は、法令および公序良俗に反する行為、当組合または第三者の権利を侵害する行為、本サイトの運営を妨げる行為をしてはなりません。虚偽の登録、不正アクセス、ウイルス送信等を禁止します。",
  },
  {
    title: "第3条（知的財産権）",
    body: "本サイトに掲載される文章、画像、ロゴ、デザイン等に関する著作権その他の知的財産権は、当組合または正当な権利者に帰属します。私的利用の範囲を超える複製、改変、頒布等は禁止します。",
  },
  {
    title: "第4条（コンテンツの内容）",
    body: "本サイトの情報は、掲載時点のものであり、将来にわたる正確性・完全性を保証するものではありません。予告なく内容を変更または削除する場合があります。重要な判断は必ず直接お問い合わせください。",
  },
  {
    title: "第5条（会員向けサービス）",
    body: "会員専用ページ等がある場合、その利用は会員規約・別途定める規程に従うものとします。ID・パスワードの管理責任は利用者にあります。",
  },
  {
    title: "第6条（免責）",
    body: "当組合は、本サイトの利用により利用者に生じた損害について、当組合に故意または重過失がある場合を除き、一切の責任を負いません。本サイトからリンクされる外部サイトの内容については責任を負いません。",
  },
  {
    title: "第7条（個人情報）",
    body: "個人情報の取扱いについては、別途定める「プライバシーポリシー」に従います。",
  },
  {
    title: "第8条（準拠法・管轄）",
    body: "本規約は日本法に準拠し、本サイトに関して紛争が生じた場合、当組合の所在地を管轄する裁判所を第一審の専属的合意管轄とします。",
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="利用規約"
        description="本サイトのご利用にあたってお読みください。"
        breadcrumbs={[{ label: "利用規約" }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Card className="mb-8 border-primary-100 bg-primary-50/40">
          <p className="text-sm leading-relaxed text-neutral-700">
            本規約はウェブサイト利用のための一般的な例示です。実際の公開前に、組合の実態に合わせて条文の追加・修正および法務確認を行ってください。
          </p>
        </Card>
        <div className="space-y-6">
          <p className="text-sm text-neutral-500">
            施行日：2026年4月1日（※例示）
          </p>
          {SECTIONS.map((s) => (
            <Card key={s.title}>
              <h2 className="text-base font-bold text-primary-700">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                {s.body}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
