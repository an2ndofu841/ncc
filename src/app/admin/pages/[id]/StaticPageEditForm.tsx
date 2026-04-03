"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";
import type { StaticPage } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StaticPageEditForm({ page }: { page: StaticPage }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const title = String(fd.get("title") ?? "").trim();
    const content = String(fd.get("content") ?? "");
    const is_published = fd.get("is_published") === "on";

    const supabase = createClient();
    const { error: upErr } = await supabase
      .from("static_pages")
      .update({
        title,
        content,
        is_published,
      })
      .eq("id", page.id);

    setLoading(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    router.push("/admin/pages");
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
        label="スラッグ（URL識別子）"
        value={page.slug}
        readOnly
        className="bg-neutral-50"
      />
      <Input name="title" label="ページタイトル" required defaultValue={page.title} />
      <Textarea
        name="content"
        label="本文（HTML可のプレーンテキスト運用の場合はそのまま表示されます）"
        rows={16}
        defaultValue={page.content}
      />
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={page.is_published}
          className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
        />
        サイト上で公開する
      </label>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={loading}>
          保存する
        </Button>
        <Link href="/admin/pages">
          <Button type="button" variant="outline">
            一覧へ戻る
          </Button>
        </Link>
      </div>
    </form>
  );
}
