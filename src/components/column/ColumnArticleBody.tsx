"use client";

import { useMemo } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const SUPERVISOR_PHOTO = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/kitagawafusao1.png`;

function extractHeadings(html: string): { toc: TocItem[]; processedHtml: string } {
  const toc: TocItem[] = [];
  let counter = 0;

  const processedHtml = html.replace(
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

  return { toc, processedHtml };
}

export default function ColumnArticleBody({ html }: { html: string }) {
  const { toc, processedHtml } = useMemo(() => extractHeadings(html), [html]);

  if (toc.length === 0) {
    return (
      <>
        <SupervisorCard />
        <div
          className="column-content text-neutral-800"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </>
    );
  }

  return (
    <>
      {/* 目次 */}
      <nav className="mb-8 rounded-xl border border-neutral-200 bg-neutral-50/80 p-5 sm:p-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-dark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          目次
        </h2>
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

      {/* 本文 */}
      <div
        className="column-content text-neutral-800"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    </>
  );
}

function SupervisorCard() {
  return (
    <div className="mb-8 flex items-center gap-4 rounded-xl border border-primary-100 bg-gradient-to-r from-primary-50 to-white p-4 sm:gap-5 sm:p-5">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md sm:h-20 sm:w-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SUPERVISOR_PHOTO}
          alt="監修者 北川房雄"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-primary sm:text-sm">監修者</p>
        <p className="mt-0.5 text-base font-bold text-neutral-900 sm:text-lg">
          北川 房雄
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-neutral-500 sm:text-sm">
          全日本カイロプラクティック施術協同組合 会長
        </p>
      </div>
    </div>
  );
}
