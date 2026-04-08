import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { formatDate, NEWS_CATEGORY_LABELS } from "@/lib/utils";
import type { News } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("news")
    .select("title, excerpt")
    .eq("id", id)
    .eq("is_published", true)
    .eq("is_member_only", false)
    .single();
  return {
    title: data?.title ?? "お知らせ",
    description: data?.excerpt || undefined,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .eq("is_member_only", false)
    .single();

  if (!data) notFound();
  const news = data as News;

  return (
    <>
      <PageHeader
        title={news.title}
        breadcrumbs={[
          { label: "お知らせ", href: "/news" },
          { label: news.title },
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <time className="text-sm text-neutral-500">
            {news.published_at
              ? formatDate(news.published_at)
              : formatDate(news.created_at)}
          </time>
          <Badge
            variant={news.category === "important" ? "error" : "default"}
          >
            {NEWS_CATEGORY_LABELS[news.category] ?? news.category}
          </Badge>
        </div>
        <div className="prose prose-neutral max-w-none whitespace-pre-wrap leading-relaxed text-neutral-700">
          {news.content}
        </div>
        <div className="mt-10 pt-6 border-t border-neutral-200">
          <Link
            href="/news"
            className="text-primary hover:text-primary-light font-medium text-sm transition-colors"
          >
            ← お知らせ一覧に戻る
          </Link>
        </div>
      </article>
    </>
  );
}
