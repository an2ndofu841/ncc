import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  BookOpen,
  MapPin,
  ArrowRight,
  Calendar,
} from "lucide-react";
import Card from "@/components/ui/Card";
import StatsSection from "@/components/home/StatsSection";

export const metadata: Metadata = {
  title: "トップページ",
  description:
    "全日本カイロプラクティック施術協同組合の公式サイト。信頼と実績のカイロプラクティック施術者の全国組織です。",
};

const NEWS_PLACEHOLDER = [
  {
    date: "2026.03.15",
    title: "2026年度 春季研修会の開催について",
    href: "/news",
  },
  {
    date: "2026.02.28",
    title: "会員向け情報システムのメンテナンスのお知らせ",
    href: "/news",
  },
  {
    date: "2026.01.10",
    title: "新年のご挨拶と今年度の活動方針",
    href: "/news",
  },
];

const FEATURES = [
  {
    icon: Award,
    title: "信頼の組合認定",
    body: "厳正な審査に基づく認定制度により、施術者としての専門性と倫理観を社会に示します。",
  },
  {
    icon: BookOpen,
    title: "充実の研修制度",
    body: "最新の知見と技術を学べる研修・セミナーを継続的に開催し、会員の成長を支援します。",
  },
  {
    icon: MapPin,
    title: "全国ネットワーク",
    body: "全国各地の加盟院・会員が連携し、情報共有と相互扶助の場を広げています。",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        {/* 背景画像 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/fv01.png`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* 暗めのオーバーレイ（文字を読みやすくする） */}
        <div className="absolute inset-0 bg-primary-dark/55" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <p className="text-xs font-medium tracking-wide text-accent-light sm:text-sm">
            厚生労働大臣認可　厚生省収健政 第93号
          </p>
          <p className="mt-1 text-sm font-medium tracking-wide text-white/85 sm:text-base">
            全日本カイロプラクティック施術協同組合
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            信頼と実績のカイロプラクティック施術者の全国組織
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            施術者の地位向上、安全で質の高いケアの普及、そして業界の健全な発展を目指し、会員とともに歩みます。
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/membership"
              className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-7 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary sm:w-auto"
            >
              入会案内を見る
            </Link>
            <Link
              href="/about"
              className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white bg-white/10 px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary sm:w-auto"
            >
              組合について
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-neutral-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-primary-700 sm:text-3xl">
              組合の強み
            </h2>
            <p className="mt-3 text-neutral-600">
              会員の皆様と社会の双方に価値を届ける、三本柱の取り組みです。
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <Card
                key={title}
                className="border-primary-100 transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-neutral-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {body}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold text-primary-700 sm:text-3xl">
                お知らせ
              </h2>
              <p className="mt-2 text-neutral-600">
                最新の情報をご確認ください。
              </p>
            </div>
            <Link
              href="/news"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light"
            >
              一覧へ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-8 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white shadow-sm">
            {NEWS_PLACEHOLDER.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-primary-50 sm:flex-row sm:items-center sm:gap-6"
                >
                  <span className="flex shrink-0 items-center gap-1.5 text-sm text-neutral-500">
                    <Calendar className="h-4 w-4" />
                    {item.date}
                  </span>
                  <span className="font-medium text-neutral-800">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA banner */}
      <section className="border-y border-accent-dark/30 bg-gradient-to-r from-accent-dark via-accent to-accent-light py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            入会案内
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/95 sm:text-base">
            組合認定と研修、全国ネットワークのメリットをご活用ください。まずは入会の流れと会員種別をご覧いただけます。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3 text-base font-semibold text-primary shadow-md transition-colors hover:bg-neutral-50"
            >
              入会のご案内
            </Link>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white bg-transparent px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-white/15"
            >
              入会申込みフォーム
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsSection />
    </div>
  );
}
