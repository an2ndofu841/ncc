import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import type { News } from "@/lib/types";
import { formatDate, NEWS_CATEGORY_LABELS } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberNewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const news = row as News;

  return (
    <>
      <PageHeader
        title={news.title}
        description={
          news.published_at
            ? `掲載日 ${formatDate(news.published_at)}`
            : undefined
        }
        breadcrumbs={[
          { label: "会員ページ", href: "/member" },
          { label: "お知らせ", href: "/member/news" },
          { label: "詳細" },
        ]}
      />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/member/news"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-light"
        >
          <ArrowLeft className="h-4 w-4" />
          お知らせ一覧に戻る
        </Link>

        <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 pb-4">
            {news.published_at && (
              <time
                dateTime={news.published_at}
                className="text-sm text-neutral-500"
              >
                {formatDate(news.published_at)}
              </time>
            )}
            <Badge variant="info">
              {NEWS_CATEGORY_LABELS[news.category] ?? news.category}
            </Badge>
            {news.is_member_only && (
              <Badge variant="warning">会員限定</Badge>
            )}
          </div>
          <div className="prose prose-neutral mt-6 max-w-none text-neutral-800">
            <div className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
              {news.content}
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
