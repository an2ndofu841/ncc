import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import ColumnArticleBody from "@/components/column/ColumnArticleBody";
import { createServiceClient } from "@/lib/supabase/server";
import { COLUMN_CATEGORY_LABELS, formatDate } from "@/lib/utils";
import type { Column } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AdminColumnPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("columns")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  const column = data as Column;

  const displayDate = column.published_at ?? column.created_at;

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm shadow-sm">
        <span className="font-semibold text-amber-700">
          プレビュー表示（{column.is_published ? "公開中" : "未公開"}）
        </span>
        <Link
          href={`/admin/columns/${id}`}
          className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
        >
          編集に戻る
        </Link>
      </div>
      <div className="pt-10">
        <Header />
        <main className="min-h-0 flex-1">
          <PageHeader
            title={column.title}
            breadcrumbs={[
              { label: "コラム", href: "/columns" },
              { label: column.title },
            ]}
          />
          <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
            {column.thumbnail_url ? (
              <figure className="mb-8 overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={column.thumbnail_url}
                  alt={column.title}
                  className="aspect-[16/9] w-full object-cover sm:aspect-[2/1]"
                />
              </figure>
            ) : null}

            <header className="mb-8 flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="default"
                  className="border border-primary-200 bg-primary-50 text-primary-700"
                >
                  {COLUMN_CATEGORY_LABELS[column.category] ?? column.category}
                </Badge>
                <time className="text-sm text-neutral-500" dateTime={displayDate}>
                  {column.published_at
                    ? formatDate(column.published_at)
                    : formatDate(column.created_at)}
                </time>
              </div>
              {column.author_name ? (
                <p className="text-sm text-neutral-700">
                  <span className="text-neutral-500">執筆</span>{" "}
                  <span className="font-medium">{column.author_name}</span>
                </p>
              ) : null}
            </header>

            <ColumnArticleBody html={column.content} />

            {column.tags && column.tags.length > 0 ? (
              <footer className="mt-10 border-t border-neutral-200 pt-8">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  タグ
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {column.tags.map((tag) => (
                    <li key={tag}>
                      <Badge
                        variant="default"
                        className="rounded-md border border-accent/30 bg-[#faf6eb] px-2 py-0.5 text-xs font-normal text-[#6b5a2a]"
                      >
                        {tag}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </footer>
            ) : null}

            <nav
              className="mt-10 border-t border-neutral-200 pt-6"
              aria-label="コラムナビゲーション"
            >
              <Link
                href="/columns"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-light"
              >
                <span aria-hidden>←</span>
                コラム一覧に戻る
              </Link>
            </nav>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
