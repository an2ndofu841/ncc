import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "全日本カイロプラクティック施術協同組合における個人情報の取扱いについて定めた方針です。",
};

const SECTIONS = [
  {
    title: "第1条（基本方針）",
    body: "全日本カイロプラクティック施術協同組合（以下「当組合」といいます。）は、個人情報の重要性を認識し、個人情報の保護に関する法律その他関連法令・ガイドラインを遵守し、適切に取得、利用、保管、開示、削除等を行います。",
  },
  {
    title: "第2条（取得する情報）",
    body: "当組合は、入会申込、お問い合わせ、イベント・研修の申込、会員サービスの提供等に際し、氏名、住所、電話番号、メールアドレス、勤務先・施設情報、資格・経歴に関する情報等を取得する場合があります。",
  },
  {
    title: "第3条（利用目的）",
    body: "取得した個人情報は、次の目的の範囲内で利用します。（1）会員管理、認定・会費等の手続（2）研修・セミナー等の運営・連絡（3）資料・情報の送付（4）お問い合わせへの対応（5）統計資料の作成（匿名化する場合を含む）（6）法令に基づく対応その他、上記に付随する業務。",
  },
  {
    title: "第4条（第三者提供）",
    body: "当組合は、法令に基づく場合を除き、本人の同意なく第三者に個人情報を提供しません。業務委託先に預託する場合は、必要な契約を締結し、適切に監督します。",
  },
  {
    title: "第5条（安全管理措置）",
    body: "個人情報への不正アクセス、漏えい、滅失、毀損等を防止するため、組織的・人的・物理的・技術的安全管理措置を講じます。",
  },
  {
    title: "第6条（開示・訂正・利用停止等）",
    body: "本人から個人情報の開示、訂正、追加、削除、利用停止等の請求があった場合、法令に従い適切に対応します。手続の詳細はお問い合わせ窓口までご連絡ください。",
  },
  {
    title: "第7条（Cookie等）",
    body: "当組合のウェブサイトでは、サービス向上のためCookieや類似技術を使用する場合があります。ブラウザの設定によりCookieを無効化できますが、一部機能が利用できなくなることがあります。",
  },
  {
    title: "第8条（本ポリシーの変更）",
    body: "当組合は、法令の改正や事業内容の変更等に応じ、本ポリシーを改定することがあります。改定後の内容は当サイトに掲載した時点から効力を生じるものとします。",
  },
  {
    title: "第9条（お問い合わせ窓口）",
    body: "個人情報の取扱いに関するお問い合わせは、当組合事務局（電話・メール等は組合概要の連絡先をご参照ください）までご連絡ください。",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="プライバシーポリシー"
        description="当組合における個人情報の取扱いについて"
        breadcrumbs={[{ label: "プライバシーポリシー" }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Card className="mb-8 border-primary-100 bg-primary-50/40">
          <p className="text-sm leading-relaxed text-neutral-700">
            本ポリシーは、一般的な協同組合・団体サイト向けの例示です。実運用にあわせて法務確認のうえ、組織名・窓口・委託先・保有データ項目等を具体化してください。
          </p>
        </Card>
        <div className="space-y-6">
          <p className="text-sm text-neutral-500">
            制定日：2026年4月1日（※例示）
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
