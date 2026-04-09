"use client";

import CountUp from "@/components/ui/CountUp";

const ESTABLISHED = new Date(1999, 2, 10); // 1999年3月10日

function getYearsSinceEstablished(): number {
  const now = new Date();
  let years = now.getFullYear() - ESTABLISHED.getFullYear();
  const monthDay =
    now.getMonth() * 100 + now.getDate() <
    ESTABLISHED.getMonth() * 100 + ESTABLISHED.getDate();
  if (monthDay) years--;
  return years;
}

const STATS = [
  { end: getYearsSinceEstablished(), suffix: "年", label: "設立からの年数" },
  { end: 86, suffix: "+", label: "加盟院数（院）" },
  { end: 104, suffix: "+", label: "研修実施回数（累計）" },
];

export default function StatsSection() {
  return (
    <section className="bg-primary-dark py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl font-bold sm:text-2xl">
          数字で見る組合
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <CountUp
                end={stat.end}
                suffix={stat.suffix}
                duration={2000}
                className="text-4xl font-bold tabular-nums text-accent sm:text-5xl"
              />
              <p className="mt-2 text-sm font-medium text-white/90">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
