import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import {
  GraduationCap,
  BadgeCheck,
  Presentation,
  Handshake,
  HeartHandshake,
  Leaf,
  Globe,
  Bone,
  Brain,
  Hospital,
  Check,
} from "lucide-react";

export const metadata: Metadata = {
  title: "活動内容",
  description:
    "研修・認定、業界連携、会員支援、社会貢献など、当組合の主な活動内容をご紹介します。",
};

const ACTIVITIES = [
  {
    icon: GraduationCap,
    title: "施術者の技術向上",
    body: "継続的な学習機会の提供、症例検討、指導者育成などを通じ、施術の質と安全性の向上を支援します。",
  },
  {
    icon: BadgeCheck,
    title: "資格認定制度",
    body: "一定の基準を満たした会員に対する認定により、社会に対する信頼性の可視化に取り組みます。",
  },
  {
    icon: Presentation,
    title: "研修会・セミナー開催",
    body: "国内外の最新知見を取り入れた研修・セミナーを定期開催し、実践に活かせる学びの場を提供します。",
  },
  {
    icon: Handshake,
    title: "業界団体との連携",
    body: "関連団体・専門家との協働により、政策提言や情報交換を進め、業界全体の発展に寄与します。",
  },
  {
    icon: HeartHandshake,
    title: "会員相互扶助",
    body: "相談窓口、情報共有、地域別のネットワークづくりなど、会員同士の支え合いを促進します。",
  },
  {
    icon: Leaf,
    title: "社会貢献活動",
    body: "健康啓発、地域イベントへの参加、災害時支援の検討など、社会との接点を広げる活動を行います。",
  },
];

export default function ActivitiesPage() {
  return (
    <>
      <PageHeader
        title="活動内容"
        description="当組合が取り組む主な事業・活動の概要です。"
        breadcrumbs={[{ label: "活動内容" }]}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVITIES.map(({ icon: Icon, title, body }) => (
            <Card
              key={title}
              className="flex flex-col border-primary-100/80 transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-primary-700">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">
                {body}
              </p>
            </Card>
          ))}
        </div>

        {/* 短期留学・海外研修プログラム */}
        <div className="mt-16">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-white">
              <Globe className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-700 sm:text-2xl">
                短期留学・海外研修プログラム
              </h2>
            </div>
          </div>
          <div className="mt-1 ml-14 h-1 w-16 rounded bg-accent" />
          <p className="mt-5 text-sm leading-loose text-neutral-700">
            全日本カイロプラクティック施術協同組合では、会員の皆さまが国内にとどまらず、海外の教育機関・医療機関で学びを深められる機会を提供しています。実践的な知識と国際的な視野を養うことで、より高い専門性を身につけることを目指します。
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* 海外での解剖実習 */}
            <Card className="flex flex-col border-primary-100/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
                <Bone className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-neutral-900">
                海外での解剖実習
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                提携する海外大学にて、解剖実習に参加することができます。人体への理解をより深める貴重な機会として、臨床に活かせる学びを得られます。
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>海外提携大学での解剖実習に参加可能</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>正会員は、希望する解剖部位を指定できる場合があります</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>実習修了後、提携大学より学位または証明書が発行されます</span>
                </li>
              </ul>
            </Card>

            {/* サイコロジーコース */}
            <Card className="flex flex-col border-primary-100/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
                <Brain className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-neutral-900">
                サイコロジーコース
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                身体面だけでなく、心の理解を深めるためのサイコロジーコースも用意しています。提携する海外大学にて受講でき、より多角的な視点から施術・対人支援に役立つ学びを得ることができます。
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>海外提携大学で受講可能</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>心理学的な知見を施術やコミュニケーションに活用</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>専門性の幅を広げる学習機会を提供</span>
                </li>
              </ul>
            </Card>

            {/* 海外病院研修 */}
            <Card className="flex flex-col border-primary-100/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
                <Hospital className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-neutral-900">
                海外病院研修
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                正会員を対象に、海外の病院での研修機会も設けています。海外の医療現場に触れることで、知識・技術だけでなく、国際的な医療理解を深めることができます。
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>正会員対象</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>海外病院での研修に参加可能</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>実際の医療現場を通じて視野と経験を拡大</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
