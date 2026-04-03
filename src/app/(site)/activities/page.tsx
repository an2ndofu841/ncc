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
      </div>
    </>
  );
}
