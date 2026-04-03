import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { COLUMN_CATEGORY_LABELS, formatDate } from "@/lib/utils";
import type { Column } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("columns")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("is_member_only", false)
    .single();

  const title = data?.title ?? "コラム";
  const description =
    typeof data?.excerpt === "string" && data.excerpt.trim()
      ? data.excerpt
      : undefined;

  return {
    title,
    description,
  };
}

export default async function ColumnDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("columns")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("is_member_only", false)
    .single();

  if (!data) notFound();
  const column = data as Column;

  const displayDate = column.published_at ?? column.created_at;
  const dateTimeAttr = displayDate;

  return (
    <>
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
            {/* eslint-disable-next-line @next/next/no-img-element -- 外部ストレージURL */}
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
            <time
              className="text-sm text-neutral-500"
              dateTime={dateTimeAttr}
            >
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

        <div
          className="column-content text-neutral-800"
          dangerouslySetInnerHTML={{ __html: column.content }}
        />

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

        <nav className="mt-10 pt-6 border-t border-neutral-200" aria-label="コラムナビゲーション">
          <Link
            href="/columns"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-light"
          >
            <span aria-hidden>←</span>
            コラム一覧に戻る
          </Link>
        </nav>
      </article>
    </>
  );
}
