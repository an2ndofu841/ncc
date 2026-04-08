import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  COLUMN_CATEGORY_LABELS,
  formatDate,
  truncate,
  cn,
} from "@/lib/utils";
import type { Column } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "コラム",
  description: "カイロプラクティックに関するコラム記事一覧。施術技術や健康情報など、専門家が執筆した記事をお届けします。",
};

export default async function ColumnsPage() {
  const supabase = await createClient();
  const { data: columnsList } = await supabase
    .from("columns")
    .select("*")
    .eq("is_published", true)
    .eq("is_member_only", false)
    .order("published_at", { ascending: false });

  const columns = (columnsList ?? []) as Column[];

  return (
    <>
      <PageHeader
        title="コラム"
        description="カイロプラクティックに関する情報をお届けします"
      />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {columns.length === 0 ? (
          <p className="text-center text-neutral-500 py-16 text-base">
            現在掲載中のコラムはありません。
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((col) => {
              const dateStr = col.published_at
                ? formatDate(col.published_at)
                : formatDate(col.created_at);
              const excerptText = col.excerpt
                ? truncate(col.excerpt, 140)
                : null;

              return (
                <li key={col.id} className="h-full">
                  <Card padding={false} className="h-full overflow-hidden transition-shadow hover:shadow-md">
                    <Link
                      href={`/columns/${col.slug}`}
                      className="group flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <div
                        className={cn(
                          "relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-neutral-100",
                          !col.thumbnail_url &&
                            "bg-gradient-to-br from-primary-100 via-primary-50 to-[#f5edd8]"
                        )}
                      >
                        {col.thumbnail_url ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element -- 外部ストレージURL */}
                            <img
                              src={col.thumbnail_url}
                              alt={col.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                          </>
                        ) : (
                          <div
                            className="absolute inset-0 opacity-40"
                            aria-hidden
                            style={{
                              backgroundImage:
                                "radial-gradient(circle at 20% 80%, #c8a84e33 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1a563233 0%, transparent 45%)",
                            }}
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="default"
                            className="border border-primary-200 bg-primary-50 text-primary-700"
                          >
                            {COLUMN_CATEGORY_LABELS[col.category] ??
                              col.category}
                          </Badge>
                          {col.is_member_only ? (
                            <Badge
                              variant="warning"
                              className="border border-accent/40 bg-[#faf6eb] text-[#8a7030]"
                            >
                              会員限定
                            </Badge>
                          ) : null}
                        </div>
                        <h2 className="text-lg font-bold text-neutral-900 transition-colors group-hover:text-primary sm:text-xl">
                          {col.title}
                        </h2>
                        {excerptText ? (
                          <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600">
                            {excerptText}
                          </p>
                        ) : null}
                        <div className="mt-auto flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-neutral-100 pt-4 text-sm text-neutral-500">
                          {col.author_name ? (
                            <span className="text-neutral-700">
                              {col.author_name}
                            </span>
                          ) : null}
                          <time dateTime={col.published_at ?? col.created_at}>
                            {dateStr}
                          </time>
                        </div>
                      </div>
                    </Link>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
