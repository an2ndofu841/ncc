"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import RichTextEditor from "@/components/ui/RichTextEditor";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import ColumnPreviewModal from "@/components/admin/ColumnPreviewModal";
import { createClient } from "@/lib/supabase/client";
import type { ColumnCategory } from "@/lib/types";
import { COLUMN_CATEGORY_LABELS } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

const CATEGORY_OPTIONS = Object.entries(COLUMN_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label })
);

function generateSlugFromTitle(title: string): string {
  const ascii = title
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = ascii.length > 0 ? ascii : "column";
  return `${base}-${Date.now()}`;
}

function nowDatetimeLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseTags(raw: string): string[] {
  return raw
    .split(/[,、]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function AdminColumnsNewPage() {
  const router = useRouter();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const regenerateSlug = useCallback(() => {
    const title = titleInputRef.current?.value?.trim() ?? "";
    setSlug(generateSlugFromTitle(title || "column"));
  }, []);

  async function handleThumbnailFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `columns/thumbnails/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("uploads")
        .upload(path, file, { contentType: file.type });
      if (upErr) {
        setError("サムネイルのアップロードに失敗しました: " + upErr.message);
        return;
      }
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      setThumbnailUrl(data.publicUrl);
    } finally {
      setThumbLoading(false);
      e.target.value = "";
    }
  }

  function handlePublishedChange(checked: boolean) {
    setIsPublished(checked);
    if (checked && !publishedAt.trim()) {
      setPublishedAt(nowDatetimeLocal());
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const title = String(fd.get("title") ?? "").trim();
    let slugVal = (slug || String(fd.get("slug") ?? "")).trim();
    if (!slugVal && title) {
      slugVal = generateSlugFromTitle(title);
      setSlug(slugVal);
    }
    const excerpt = String(fd.get("excerpt") ?? "").trim() || null;
    const author_name = String(fd.get("author_name") ?? "").trim() || null;
    const category = String(fd.get("category") ?? "general") as ColumnCategory;
    const tagsRaw = String(fd.get("tags") ?? "");
    const tags = parseTags(tagsRaw);
    const thumb =
      thumbnailUrl.trim() ||
      String(fd.get("thumbnail_url") ?? "").trim() ||
      null;
    const published_at = publishedAt.trim()
      ? new Date(publishedAt.trim()).toISOString()
      : null;

    if (!title) {
      setLoading(false);
      setError("タイトルを入力してください。");
      return;
    }
    if (!slugVal) {
      setLoading(false);
      setError("スラッグを入力するか、「スラッグ再生成」を押してください。");
      return;
    }

    const meta_title = String(fd.get("meta_title") ?? "").trim() || null;
    const meta_description = String(fd.get("meta_description") ?? "").trim() || null;
    const og_image_url = String(fd.get("og_image_url") ?? "").trim() || null;
    const canonical_url = String(fd.get("canonical_url") ?? "").trim() || null;
    const no_index = fd.get("no_index") === "on";

    const supabase = createClient();
    const { error: insertError } = await supabase.from("columns").insert({
      title,
      slug: slugVal,
      content: content || "<p></p>",
      excerpt,
      thumbnail_url: thumb,
      category,
      tags,
      author_id: null,
      author_name,
      is_published: isPublished,
      is_member_only: fd.get("is_member_only") === "on",
      published_at: isPublished ? published_at : null,
      meta_title,
      meta_description,
      og_image_url,
      canonical_url,
      no_index,
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push("/admin/columns");
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="コラムの新規作成"
        description="タイトル・本文・公開設定を入力してください。"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "コラム", href: "/admin/columns" },
          { label: "新規" },
        ]}
      />
      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
        >
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <Input
            ref={titleInputRef}
            id="column-new-title"
            name="title"
            label="タイトル"
            required
            onBlur={(ev) => {
              if (!slug.trim()) {
                setSlug(generateSlugFromTitle(ev.target.value));
              }
            }}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Input
                id="column-new-slug"
                name="slug"
                label="スラッグ（URL）"
                value={slug}
                onChange={(ev) => setSlug(ev.target.value)}
                placeholder="例: my-column-1730000000000"
                helperText="タイトルから自動生成されます。必要に応じて編集できます。"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0"
              onClick={regenerateSlug}
            >
              スラッグ再生成
            </Button>
          </div>
          <Select
            name="category"
            label="カテゴリ"
            options={CATEGORY_OPTIONS}
            defaultValue="general"
          />
          <Input name="author_name" label="著者名（表示用）" />
          <Textarea name="excerpt" label="抜粋・リード" rows={3} />
          <div className="space-y-2">
            <Input
              name="thumbnail_url"
              label="サムネイルURL"
              value={thumbnailUrl}
              onChange={(ev) => setThumbnailUrl(ev.target.value)}
              placeholder="https://… またはファイルをアップロード"
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary-50/70 px-4 py-2 text-sm font-medium text-primary-800 hover:bg-primary-100">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleThumbnailFile}
                  disabled={thumbLoading}
                />
                {thumbLoading ? "アップロード中…" : "画像をアップロード"}
              </label>
              <span className="text-xs text-neutral-500">
                バケット uploads / columns/thumbnails/
              </span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              本文 <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="コラム本文を入力…"
            />
          </div>
          <Input
            name="tags"
            label="タグ"
            placeholder="カンマ区切り（例: 整体, 健康）"
            helperText="複数ある場合はカンマで区切ってください。"
          />
          <div className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50/80 p-4 sm:flex-row sm:gap-8">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(ev) => handlePublishedChange(ev.target.checked)}
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
            value={publishedAt}
            onChange={(ev) => setPublishedAt(ev.target.value)}
            helperText="公開にチェックを入れたとき、空なら現在時刻を入れます。"
          />

          {/* SEO設定 */}
          <details className="rounded-lg border border-neutral-200 bg-neutral-50/50">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-neutral-700 select-none">
              SEO設定
            </summary>
            <div className="space-y-4 border-t border-neutral-200 px-4 py-4">
              <Input name="meta_title" label="メタタイトル" placeholder="未入力の場合は記事タイトルが使用されます" helperText="検索結果やブラウザタブに表示されるタイトル（60文字以内推奨）" />
              <Textarea name="meta_description" label="メタディスクリプション" rows={3} placeholder="未入力の場合は抜粋が使用されます" helperText="検索結果に表示される説明文（120〜160文字推奨）" />
              <Input name="og_image_url" label="OGP画像URL" placeholder="未入力の場合はサムネイルが使用されます" helperText="SNSでシェアされた際に表示される画像（1200×630px推奨）" />
              <Input name="canonical_url" label="canonical URL" placeholder="未入力の場合は自動設定されます" helperText="正規URLを指定したい場合のみ入力してください" />
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" name="no_index" className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary" />
                検索エンジンにインデックスさせない（noindex）
              </label>
            </div>
          </details>

          <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-4">
            <Button type="submit" loading={loading}>
              保存する
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              className="border-2 border-accent text-accent-dark hover:bg-accent/10"
            >
              プレビュー
            </Button>
            <Link href="/admin/columns">
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </Link>
          </div>
        </form>

        <ColumnPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={titleInputRef.current?.value ?? ""}
          content={content}
          category={
            (document.querySelector<HTMLSelectElement>(
              'select[name="category"]'
            )?.value ?? "general") as ColumnCategory
          }
          authorName={
            document.querySelector<HTMLInputElement>(
              'input[name="author_name"]'
            )?.value || undefined
          }
          thumbnailUrl={thumbnailUrl || undefined}
          tags={parseTags(
            document.querySelector<HTMLInputElement>('input[name="tags"]')
              ?.value ?? ""
          )}
        />
      </div>
    </>
  );
}
