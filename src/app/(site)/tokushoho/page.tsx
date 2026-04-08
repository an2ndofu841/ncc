import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description:
    "全日本カイロプラクティック施術協同組合の特定商取引法に基づく表記です。",
};

const ITEMS: { label: string; value: string }[] = [
  {
    label: "事業者名（販売者名）",
    value: "全日本カイロプラクティック施術協同組合",
  },
  {
    label: "代表者",
    value: "会長 北川 房雄",
  },
  {
    label: "所在地",
    value: "〒100-0001 東京都千代田区千代田1-1-1（※正式な住所に差し替えてください）",
  },
  {
    label: "電話番号",
    value: "03-0000-0000（※正式な番号に差し替えてください）",
  },
  {
    label: "メールアドレス",
    value: "info@ncc-chiro.or.jp",
  },
  {
    label: "ウェブサイト",
    value: "https://ncc-chiro.or.jp",
  },
  {
    label: "販売価格",
    value:
      "各サービス・商品のページに記載された金額（税込表示）。入会金・年会費については「会員種別・会費案内」ページをご参照ください。",
  },
  {
    label: "販売価格以外の必要料金",
    value:
      "振込手数料、通信費等はお客様のご負担となります。",
  },
  {
    label: "お支払い方法",
    value: "銀行振込",
  },
  {
    label: "お支払い時期",
    value:
      "入会申込み承認後、当組合よりお送りする案内に記載された期日までにお支払いください。",
  },
  {
    label: "サービスの提供時期",
    value:
      "入金確認後、速やかに会員資格を付与し、各種会員サービスの提供を開始いたします。研修・セミナー等は各開催日に実施します。",
  },
  {
    label: "返品・キャンセルについて",
    value:
      "サービスの性質上、入会金・年会費・認定料のお支払い後の返金は原則として承っておりません。研修・セミナーのキャンセルについては、各研修の案内に記載されたキャンセルポリシーに従います。",
  },
  {
    label: "解約について",
    value:
      "退会を希望される場合は、事務局までご連絡ください。退会手続きの詳細についてご案内いたします。既にお支払いいただいた会費の返金はいたしかねます。",
  },
  {
    label: "動作環境",
    value:
      "当組合ウェブサイトの推奨ブラウザは、最新版の Google Chrome、Safari、Firefox、Microsoft Edge です。",
  },
  {
    label: "特別な販売条件",
    value:
      "当組合の会員サービスは、入会審査の結果によりご利用いただけない場合があります。",
  },
];

export default function TokushohoPage() {
  return (
    <>
      <PageHeader
        title="特定商取引法に基づく表記"
        description="特定商取引法に基づく表記をご確認いただけます。"
        breadcrumbs={[{ label: "特定商取引法に基づく表記" }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Card className="mb-8 border-primary-100 bg-primary-50/40">
          <p className="text-sm leading-relaxed text-neutral-700">
            本表記は一般的な記載例です。実運用にあわせて法務確認のうえ、正式な内容に差し替えてください。
          </p>
        </Card>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <tbody>
              {ITEMS.map((item, i) => (
                <tr
                  key={item.label}
                  className={
                    i < ITEMS.length - 1
                      ? "border-b border-neutral-100"
                      : ""
                  }
                >
                  <th className="w-1/3 bg-neutral-50 px-5 py-4 text-left align-top font-semibold text-neutral-700">
                    {item.label}
                  </th>
                  <td className="px-5 py-4 leading-relaxed text-neutral-700">
                    {item.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
