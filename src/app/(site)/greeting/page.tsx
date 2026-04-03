import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "会長あいさつ",
  description:
    "全日本カイロプラクティック施術協同組合 会長より、会員の皆様と社会の皆様へのご挨拶です。",
};

const PHOTO_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/kitagawafusao1.png`;

export default function GreetingPage() {
  return (
    <>
      <PageHeader
        title="会長あいさつ"
        description="会長より、組合の理念と今後の展望についてご挨拶申し上げます。"
        breadcrumbs={[{ label: "会長あいさつ" }]}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Card className="overflow-hidden lg:flex lg:gap-0 lg:p-0">
          <div className="flex shrink-0 flex-col items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 px-8 py-12 lg:w-[280px] lg:border-r lg:border-primary-100">
            <div className="h-44 w-44 overflow-hidden rounded-full border-4 border-white shadow-inner sm:h-52 sm:w-52">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PHOTO_URL}
                alt="会長 北川房雄"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-6 text-center text-sm font-bold text-primary-700">
              会長　北川 房雄
            </p>
          </div>
          <div className="p-6 sm:p-8 lg:flex-1 lg:p-10">
            <p className="text-sm leading-loose text-neutral-700">
              謹んで初春の候、会員各位ならびに当組合の活動にご理解・ご支援を賜ります関係者の皆様に、心より御礼申し上げます。
            </p>
            <p className="mt-6 text-sm leading-loose text-neutral-700">
              全日本カイロプラクティック施術協同組合は、施術者一人ひとりの専門性と誇りを大切にし、利用者の皆様に安心してお選びいただける環境づくりに全力で取り組んでまいりました。変化の激しい時代においても、科学的知見と倫理観に基づく施術の普及、そして会員相互の学びと連帯を通じて、業界全体の信頼向上を目指します。
            </p>
            <p className="mt-6 text-sm leading-loose text-neutral-700">
              今後とも組合活動へのご参加とご協力を賜りますよう、よろしくお願い申し上げます。
            </p>
            <p className="mt-10 text-right text-sm font-medium text-neutral-800">
              全日本カイロプラクティック施術協同組合
              <br />
              会長　北川 房雄
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
