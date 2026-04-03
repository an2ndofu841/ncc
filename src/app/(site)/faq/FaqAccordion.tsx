"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "全日本カイロプラクティック施術協同組合とは何ですか？",
    a: "全国のカイロプラクティック施術者および関係者が参画する協同組合です。技術向上、認定、研修、会員相互扶助などを通じて、施術の質と業界の信頼向上を図ります。",
  },
  {
    q: "どのような方が入会できますか？",
    a: "会員種別により対象が異なります。正会員・準会員は施術の実務や関連条件を満たす方、学生会員は在学中の方、賛助会員は理念に賛同する法人・団体等を想定しています。詳細は会員規約および事務局へお問い合わせください。",
  },
  {
    q: "入会金と年会費はいくらですか？",
    a: "会員種別ごとに入会金・年会費が定められています。正会員は入会金30,000円・年会費36,000円、準会員は入会金20,000円・年会費24,000円、学生会員は入会金無料・年会費12,000円、賛助会員は入会金10,000円・年会費24,000円（いずれも例示・税等は別途案内）です。",
  },
  {
    q: "支払い方法は選べますか？",
    a: "銀行振込等、事務局が指定する方法でのお支払いとなります。クレジットカード対応の有無は随時案内をご確認ください。",
  },
  {
    q: "認定制度にはどのように申し込みますか？",
    a: "所定の申請書類と審査基準に基づき、事務局が手続を案内します。研修受講歴や実務要件等がある場合があります。",
  },
  {
    q: "研修会への参加は必須ですか？",
    a: "会員種別・認定区分により推奨・必須が異なる場合があります。詳細は会員向け通知または事務局にお問い合わせください。",
  },
  {
    q: "退会や休会はできますか？",
    a: "会員規約に定める手続に従い、所定の届出により退会が可能です。休会制度の有無・条件については事務局へご確認ください。",
  },
  {
    q: "個人情報はどのように扱われますか？",
    a: "当組合は、法令に基づき適切に個人情報を管理します。取扱いの詳細は「プライバシーポリシー」をご覧ください。",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white shadow-sm">
      {FAQ_ITEMS.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-primary-50/80 sm:px-6"
              aria-expanded={open}
            >
              <span className="text-sm font-semibold text-neutral-900 sm:text-base">
                Q. {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-primary transition-transform",
                  open && "rotate-180"
                )}
              />
            </button>
            {open && (
              <div className="border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 sm:px-6">
                <p className="text-sm leading-relaxed text-neutral-600">
                  A. {item.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
