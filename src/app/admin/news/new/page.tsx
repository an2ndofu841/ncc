"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";
import { NEWS_CATEGORY_LABELS } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORY_OPTIONS = Object.entries(NEWS_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label })
);

export default function AdminNewsNewPage() {
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
    const { error: insertError } = await supabase.from("news").insert({
      title,
      content,
      excerpt,
      category,
      is_published,
      is_member_only,
      published_at,
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push("/admin/news");
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="お知らせの新規作成"
        description="内容を入力して公開設定を行ってください。"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "お知らせ", href: "/admin/news" },
          { label: "新規" },
        ]}
      />
      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <Input name="title" label="タイトル" required />
          <Textarea name="content" label="本文" required rows={12} />
          <Input name="excerpt" label="抜粋（一覧用）" />
          <Select
            name="category"
            label="カテゴリ"
            options={CATEGORY_OPTIONS}
            defaultValue="notice"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_published"
                className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
              />
              公開する
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_member_only"
                className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
              />
              会員限定
            </label>
          </div>
          <Input
            name="published_at"
            label="公開日時"
            type="datetime-local"
            helperText="未入力の場合は公開日時を自動設定しません。"
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={loading}>
              保存する
            </Button>
            <Link href="/admin/news">
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
