"use client";

import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const SUPERVISOR_PHOTO = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/kitagawafusao1.png`;

function buildTocAndInject(html: string): {
  beforeFirstH2: string;
  afterFirstH2: string;
  toc: TocItem[];
} {
  const toc: TocItem[] = [];
  let counter = 0;

  const processed = html.replace(
    /<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attrs: string, inner: string) => {
      counter++;
      const id = `heading-${counter}`;
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const level = parseInt(tag.charAt(1), 10);
      toc.push({ id, text, level });

      if (/id\s*=/.test(attrs)) {
        return `<${tag}${attrs.replace(/id\s*=\s*["'][^"']*["']/, `id="${id}"`)}>` + inner + `</${tag}>`;
      }
      return `<${tag} id="${id}"${attrs}>${inner}</${tag}>`;
    }
  );

  const firstH2 = toc.find((t) => t.level === 2);
  if (!firstH2) {
    return { beforeFirstH2: processed, afterFirstH2: "", toc };
  }

  const marker = `id="${firstH2.id}"`;
  const idx = processed.indexOf(marker);
  if (idx === -1) {
    return { beforeFirstH2: processed, afterFirstH2: "", toc };
  }

  const tagStart = processed.lastIndexOf("<", idx);
  return {
    beforeFirstH2: processed.slice(0, tagStart),
    afterFirstH2: processed.slice(tagStart),
    toc,
  };
}

export default function ColumnArticleBody({ html }: { html: string }) {
  const { beforeFirstH2, afterFirstH2, toc } = useMemo(
    () => buildTocAndInject(DOMPurify.sanitize(html, { ADD_ATTR: ["target"] })),
    [html]
  );

  const hasH2 = toc.some((t) => t.level === 2);

  if (!hasH2) {
    return (
      <>
        <SupervisorCard />
        <div
          className="column-content text-neutral-800"
          dangerouslySetInnerHTML={{ __html: beforeFirstH2 }}
        />
      </>
    );
  }

  return (
    <>
      {/* 最初のH2より前の本文 */}
      {beforeFirstH2.trim() && (
        <div
          className="column-content text-neutral-800"
          dangerouslySetInnerHTML={{ __html: beforeFirstH2 }}
        />
      )}

      {/* 目次 */}
      <nav className="my-8 rounded-xl border border-neutral-200 bg-neutral-50/80 p-5 sm:p-6">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-dark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          目次
        </p>
        <ol className="space-y-1 text-sm">
          {toc.map((item) => (
            <li
              key={item.id}
              style={{ paddingLeft: `${(item.level - 1) * 1}rem` }}
            >
              <a
                href={`#${item.id}`}
                className="inline-block rounded px-1.5 py-1 text-neutral-700 transition-colors hover:bg-primary-50 hover:text-primary"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 監修者情報 */}
      <SupervisorCard />

      {/* 最初のH2以降の本文 */}
      <div
        className="column-content text-neutral-800"
        dangerouslySetInnerHTML={{ __html: afterFirstH2 }}
      />
    </>
  );
}

function SupervisorCard() {
  return (
    <div className="mb-8 rounded-xl border border-primary-100 bg-gradient-to-r from-primary-50 to-white p-5 sm:p-6">
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md sm:h-24 sm:w-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SUPERVISOR_PHOTO}
            alt="監修者 北川房雄"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="inline-block rounded bg-primary px-2 py-0.5 text-[11px] font-bold tracking-wide text-white">
            この記事の監修者
          </p>
          <p className="mt-1.5 text-lg font-bold text-neutral-900">
            北川 房雄
          </p>
          <p className="mt-0.5 text-sm font-medium text-primary-dark">
            全日本カイロプラクティック施術協同組合 会長
          </p>
        </div>
      </div>
      <div className="mt-4 border-t border-primary-100 pt-3">
        <ul className="space-y-1 text-xs leading-relaxed text-neutral-600 sm:text-sm">
          <li>医学博士・カイロプラクティック歴30年以上</li>
          <li>2010年 セント・スタニスラス「コマンドール・クロス勲章」受章（日本人歴代7人目・最年少記録）</li>
          <li>2014年 米国ホワイトハウスより大統領奉仕賞受賞</li>
          <li>2014年 英国政府よりサータイトル授与（北海道初）</li>
        </ul>
      </div>
    </div>
  );
}
