"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";
import type { SeminarStatus } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "draft", label: "下書き" },
  { value: "published", label: "公開中" },
  { value: "closed", label: "終了" },
  { value: "cancelled", label: "中止" },
];

export default function AdminSeminarNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const dateRaw = String(fd.get("date") ?? "");
    const deadlineRaw = String(fd.get("deadline") ?? "").trim();

    const payload = {
      title: String(fd.get("title") ?? "").trim(),
      description: String(fd.get("description") ?? ""),
      date: dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString(),
      venue: String(fd.get("venue") ?? "").trim(),
      instructor: String(fd.get("instructor") ?? "").trim() || null,
      capacity: Number(fd.get("capacity") ?? 30) || 30,
      fee: Number(fd.get("fee") ?? 0) || 0,
      deadline: deadlineRaw ? new Date(deadlineRaw).toISOString() : null,
      status: String(fd.get("status") ?? "draft") as SeminarStatus,
    };

    const supabase = createClient();
    const { error: insErr } = await supabase.from("seminars").insert(payload);

    setLoading(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    router.push("/admin/seminars");
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="セミナー新規作成"
        description="開催情報を入力してください。"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "セミナー", href: "/admin/seminars" },
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
          <Textarea name="description" label="説明" required rows={8} />
          <Input name="date" label="開催日時" type="datetime-local" required />
          <Input name="venue" label="会場" required />
          <Input name="instructor" label="講師" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="capacity"
              label="定員"
              type="number"
              min={1}
              defaultValue={30}
            />
            <Input name="fee" label="参加費（円）" type="number" min={0} defaultValue={0} />
          </div>
          <Input
            name="deadline"
            label="申込締切"
            type="datetime-local"
          />
          <Select
            name="status"
            label="ステータス"
            options={STATUS_OPTIONS}
            defaultValue="draft"
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={loading}>
              保存する
            </Button>
            <Link href="/admin/seminars">
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
