import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import type { News } from "@/lib/types";
import { formatDate, NEWS_CATEGORY_LABELS } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function MemberNewsListPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("news")
    .select("id, title, category, published_at, is_member_only, excerpt")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false });

  const items = (rows ?? []) as Pick<
    News,
    "id" | "title" | "category" | "published_at" | "is_member_only" | "excerpt"
  >[];

  return (
    <>
      <PageHeader
        title="会員向けお知らせ"
        description="公開中のお知らせ（一般公開分・会員限定分）を一覧表示しています。"
        breadcrumbs={[
          { label: "会員ページ", href: "/member" },
          { label: "お知らせ" },
        ]}
      />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500 shadow-sm">
            お知らせはまだありません。
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/member/news/${n.id}`}
                  className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-primary-50 sm:px-5 sm:py-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {n.published_at && (
                        <time
                          dateTime={n.published_at}
                          className="text-xs text-neutral-500"
                        >
                          {formatDate(n.published_at)}
                        </time>
                      )}
                      <Badge variant="default" className="text-[10px]">
                        {NEWS_CATEGORY_LABELS[n.category] ?? n.category}
                      </Badge>
                      {n.is_member_only && (
                        <Badge variant="warning" className="text-[10px]">
                          会員限定
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 font-semibold text-neutral-900">
                      {n.title}
                    </p>
                    {n.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                        {n.excerpt}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    className="mt-1 h-5 w-5 shrink-0 text-neutral-400"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
