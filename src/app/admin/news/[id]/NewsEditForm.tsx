"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";
import type { News } from "@/lib/types";
import { NEWS_CATEGORY_LABELS } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORY_OPTIONS = Object.entries(NEWS_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label })
);

function toDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewsEditForm({ news }: { news: News }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const title = String(fd.get("title") ?? "").trim();
    const content = String(fd.get("content") ?? "");
    const excerpt = String(fd.get("excerpt") ?? "").trim() || null;
    const category = String(fd.get("category") ?? "notice");
    const is_published = fd.get("is_published") === "on";
    const is_member_only = fd.get("is_member_only") === "on";
    const publishedAtRaw = String(fd.get("published_at") ?? "").trim();
    const published_at = publishedAtRaw
      ? new Date(publishedAtRaw).toISOString()
      : null;

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("news")
      .update({
        title,
        content,
        excerpt,
        category,
        is_published,
        is_member_only,
        published_at,
      })
      .eq("id", news.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/admin/news");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <Input
        name="title"
        label="タイトル"
        required
        defaultValue={news.title}
      />
      <Textarea
        name="content"
        label="本文"
        required
        rows={12}
        defaultValue={news.content}
      />
      <Input
        name="excerpt"
        label="抜粋（一覧用）"
        defaultValue={news.excerpt ?? ""}
      />
      <Select
        name="category"
        label="カテゴリ"
        options={CATEGORY_OPTIONS}
        defaultValue={news.category}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={news.is_published}
            className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
          />
          公開する
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_member_only"
            defaultChecked={news.is_member_only}
            className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
          />
          会員限定
        </label>
      </div>
      <Input
        name="published_at"
        label="公開日時"
        type="datetime-local"
        defaultValue={toDatetimeLocal(news.published_at)}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={loading}>
          更新する
        </Button>
        <Link href="/admin/news">
          <Button type="button" variant="outline">
            一覧へ戻る
          </Button>
        </Link>
      </div>
    </form>
  );
}
