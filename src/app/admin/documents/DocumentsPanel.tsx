"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";
import type { Document } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DocumentsPanel({
  documents,
  uploadAction,
}: {
  documents: Document[];
  uploadAction: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSignedUrl(path: string) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) {
      alert("ダウンロードURLの取得に失敗しました: " + (error?.message ?? ""));
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`「${doc.title}」を削除しますか？`)) return;
    const supabase = createClient();
    const storagePath = doc.file_url;
    await supabase.storage.from("documents").remove([storagePath]);
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    if (error) {
      alert("削除に失敗しました: " + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {msg && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          {msg}
        </p>
      )}

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          書類をアップロード
        </h2>
        <form
          action={(fd) => {
            setMsg(null);
            startTransition(async () => {
              try {
                await uploadAction(fd);
                setMsg("アップロードが完了しました。");
                router.refresh();
              } catch (e) {
                alert(
                  e instanceof Error ? e.message : "アップロードに失敗しました。"
                );
              }
            });
          }}
          className="space-y-4 max-w-xl"
        >
          <Input name="title" label="表示タイトル" required />
          <Input name="category" label="カテゴリ" defaultValue="general" />
          <Textarea name="description" label="説明" rows={3} />
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_published"
              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            会員向けに公開する
          </label>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              ファイル<span className="ml-1 text-red-500">*</span>
            </label>
            <input
              name="file"
              type="file"
              required
              className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
          <Button type="submit" loading={pending}>
            アップロード
          </Button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          登録済み書類
        </h2>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr className="text-neutral-600">
                <th className="px-4 py-3 font-medium">タイトル</th>
                <th className="px-4 py-3 font-medium">カテゴリ</th>
                <th className="px-4 py-3 font-medium">公開</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-neutral-500"
                  >
                    書類がまだありません。
                  </td>
                </tr>
              ) : (
                documents.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-neutral-100 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">
                        {d.title}
                      </div>
                      <div className="text-xs text-neutral-500">{d.file_name}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{d.category}</td>
                    <td className="px-4 py-3 text-neutral-700">
                      {d.is_published ? "公開" : "非公開"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void handleSignedUrl(d.file_url)}
                        >
                          ダウンロード
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => void handleDelete(d)}
                        >
                          削除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
