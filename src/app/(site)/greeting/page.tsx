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

        {/* プロフィール */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-primary-700 sm:text-2xl">
            会長プロフィール
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-accent" />

          <Card className="mt-6">
            <h3 className="text-lg font-bold text-neutral-900">
              北川 房雄
              <span className="ml-2 text-sm font-normal text-neutral-500">
                （きたがわ ふさお）
              </span>
            </h3>

            <div className="mt-6 space-y-6 text-sm leading-loose text-neutral-700">
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                  経歴
                </h4>
                <p>
                  1960年4月23日　北海道夕張市に産まれ、士別市育ち。
                </p>
                <p className="mt-2">
                  旭川工業高卒業後、（社）北海道治療師会医学院、全国キネシオテーピング協会、フィリピンST・マイケルインターナショナルカレッジ留学、カリタスファミリーカレッジ留学、ラサールダスマカレッジ留学、MRCカイロプラクティック学院講師を歴任。
                </p>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                  現職
                </h4>
                <ul className="list-disc space-y-1 pl-5">
                  <li>JMA（日本初、旧労働省より短期職業訓練を認可された団体）代表理事会長</li>
                  <li>日本カイロプラクティック医学会 会長</li>
                  <li>NCC 全日本カイロプラクティック施術協同組合 代表理事会長</li>
                  <li>北海道カイロプラクティック協同組合（北海道知事認可）代表理事</li>
                  <li>北海道政治経済連 代表</li>
                  <li>全国21世紀の会 代表</li>
                  <li>日本カイロプラクティックドクター師会 会長</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                  受賞歴
                </h4>
                <p>
                  2010年6月5日、米国ロサンゼルス市にて、人類と社会の発展に貢献した人物に贈られる「コマンドール・クロス勲章」と「ナイト爵位」を授与。
                </p>
                <p className="mt-2">
                  2014年、アメリカ合衆国ホワイトハウスより大統領奉仕賞、イギリス大国政府よりサータイトルを受賞。この2タイトルを受賞したのは、北海道で初めてのことです。
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* 受賞・任命の詳細 */}
        <div className="mt-16 space-y-14">
          {/* コマンドール・クロス勲章 */}
          <section>
            <div className="flex items-center gap-3">
              <time className="shrink-0 rounded bg-primary px-3 py-1 text-xs font-bold text-white">
                2010.06.14
              </time>
              <h2 className="text-lg font-bold text-neutral-900 sm:text-xl">
                コマンドール・クロス勲章 授与
              </h2>
            </div>
            <div className="mt-1 h-0.5 w-full bg-neutral-200" />

            <Card className="mt-5">
              {/* 画像プレースホルダー */}
              <div className="mb-6 flex h-52 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400 sm:h-64">
                画像準備中
              </div>

              <h3 className="text-base font-bold text-primary-700">
                コマンドール・クロス勲章について
              </h3>
              <p className="mt-3 text-sm leading-loose text-neutral-700">
                全日本カイロプラクティック施術協同組合の代表理事会長であり、医学博士の北川房雄氏（50歳）は、この度、米国の公益法人である「世界学術研究アカデミー財団」の推薦を受け、医学や科学などの分野で顕著な社会貢献を果たした人物に授与される、主宰者の母国、ポーランドを発祥とするセント・スタニスラス「コマンドール・クロス」勲章を受章されました。
              </p>

              <h3 className="mt-8 text-base font-bold text-primary-700">
                北川房雄 会長の受賞について
              </h3>
              <p className="mt-3 text-sm leading-loose text-neutral-700">
                今回の北川氏の受章は、本年3月に決定し、去る6月5日にアメリカ合衆国カリフォルニア州ロサンゼルス市リッツカールトンホテルで開催される授与式に参加し、同財団のスビグナス・カシミア・プリンス・グランド・マスター公爵よりメダルと認定証が贈呈されました。なお受勲と併せて「KNIGHT（ナイト）爵位」が授与されました。
              </p>
              <p className="mt-3 text-sm leading-loose text-neutral-700">
                今回のセント・スタニスラス「コマンドール・クロス勲章」の受章は日本人として北川氏だけであり、コマンドール・クロス勲章の日本人受章としては歴代7人目になり、過去の全世界の受章者の中では最年少（50歳）での受章記録です。
              </p>
              <p className="mt-3 text-sm leading-loose text-neutral-700">
                海外の歴代受章者の中にはジョン・F・ケネディ第35代米大統領等、米大統領経験者が6名、セラヒム・ギリシャ大司教、マザー・テレサ女史、ペータル2世・ユーゴスラビア国王らが受章しています。
              </p>
            </Card>
          </section>

          {/* 大統領奉仕賞 */}
          <section>
            <div className="flex items-center gap-3">
              <time className="shrink-0 rounded bg-primary px-3 py-1 text-xs font-bold text-white">
                2014.09.30
              </time>
              <h2 className="text-lg font-bold text-neutral-900 sm:text-xl">
                大統領奉仕賞 授与
              </h2>
            </div>
            <div className="mt-1 h-0.5 w-full bg-neutral-200" />

            <Card className="mt-5">
              <div className="mb-6 flex h-52 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400 sm:h-64">
                画像準備中
              </div>

              <h3 className="text-base font-bold text-primary-700">
                大統領奉仕賞について
              </h3>
              <p className="mt-3 text-sm leading-loose text-neutral-700">
                大統領奉仕賞（The President&apos;s Volunteer Service Award）の受賞にあたり、World Peace &amp; Culture Foundation 推薦の元、アメリカ合衆国ホワイトハウスより2014年9月30日付で受賞致しました。バラク・オバマ大統領から北川会長へ表彰状が贈られました。当組合にとって大変名誉なことであります。
              </p>

              <h3 className="mt-8 text-base font-bold text-primary-700">
                北川房雄 会長の受賞について
              </h3>
              <p className="mt-3 text-sm leading-loose text-neutral-700">
                アメリカ生まれの医療である、カイロプラクティックを30年間に渡り、日本及び東南アジアに広めたとして、アメリカの医療拡大に貢献した功績を認められ、世界平和文化財団山田理事の推薦の元、受賞の運びとなりました。
              </p>
            </Card>
          </section>

          {/* サータイトル */}
          <section>
            <div className="flex items-center gap-3">
              <time className="shrink-0 rounded bg-primary px-3 py-1 text-xs font-bold text-white">
                2014.10.25
              </time>
              <h2 className="text-lg font-bold text-neutral-900 sm:text-xl">
                サータイトル 授与
              </h2>
            </div>
            <div className="mt-1 h-0.5 w-full bg-neutral-200" />

            <Card className="mt-5">
              <div className="mb-6 flex h-52 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400 sm:h-64">
                画像準備中
              </div>

              <h3 className="text-base font-bold text-primary-700">
                サータイトル受賞について
              </h3>
              <p className="mt-3 text-sm leading-loose text-neutral-700">
                World Peace &amp; Culture Foundation 推薦の元、イギリス大国政府よりサータイトル（SIR Fusao Kitagawa Lord Of Westminster）を2014年10月25日付で受賞致しました。
              </p>

              <h3 className="mt-8 text-base font-bold text-primary-700">
                北川房雄 会長の受賞について
              </h3>
              <p className="mt-3 text-sm leading-loose text-neutral-700">
                人類の福祉・医療の発展に貢献した団体へ、英国政府より与えられる名誉ある称号。元々、イギリス国民に対し、エリザベス女王より授与されておりましたが、近年は外国人にも、英国憲法・国際法に則り英国政府より授与されております。
              </p>
              <p className="mt-3 text-sm leading-loose text-neutral-700">
                東南アジア圏の学校施設において、学習環境向上の為に自費でのトイレ設置や、生活が困窮し医療行為を受けられない人達へ無償で治療を行う等の活動が評価され、1年半の選考の末、サータイトル受賞となりました。
              </p>
            </Card>
          </section>

        </div>
      </div>
    </>
  );
}
