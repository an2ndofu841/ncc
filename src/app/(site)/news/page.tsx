import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { formatDate, NEWS_CATEGORY_LABELS } from "@/lib/utils";
import type { News } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "お知らせ",
};

export default async function NewsPage() {
  const supabase = await createClient();
  const { data: newsList } = await supabase
    .from("news")
    .select("*")
    .eq("is_published", true)
    .eq("is_member_only", false)
    .order("published_at", { ascending: false })
    .limit(30);

  const news = (newsList ?? []) as News[];

  return (
    <>
      <PageHeader
        title="お知らせ"
        description="組合からの最新情報をお届けします"
        breadcrumbs={[{ label: "お知らせ" }]}
      />
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {news.length === 0 ? (
          <p className="text-center text-neutral-500 py-12">
            現在お知らせはありません。
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {news.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/news/${item.id}`}
                  className="flex flex-col gap-1 py-5 hover:bg-neutral-50 -mx-4 px-4 rounded-lg transition-colors sm:flex-row sm:items-center sm:gap-4"
                >
                  <time className="shrink-0 text-sm text-neutral-500 w-28">
                    {item.published_at
                      ? formatDate(item.published_at)
                      : formatDate(item.created_at)}
                  </time>
                  <Badge
                    variant={
                      item.category === "important" ? "error" : "default"
                    }
                  >
                    {NEWS_CATEGORY_LABELS[item.category] ?? item.category}
                  </Badge>
                  <span className="text-neutral-800 font-medium">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
