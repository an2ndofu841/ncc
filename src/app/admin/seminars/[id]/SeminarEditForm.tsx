"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";
import type { Seminar, SeminarStatus } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "draft", label: "下書き" },
  { value: "published", label: "公開中" },
  { value: "closed", label: "終了" },
  { value: "cancelled", label: "中止" },
];

function toLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SeminarEditForm({ seminar }: { seminar: Seminar }) {
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
      date: dateRaw ? new Date(dateRaw).toISOString() : seminar.date,
      venue: String(fd.get("venue") ?? "").trim(),
      instructor: String(fd.get("instructor") ?? "").trim() || null,
      capacity: Number(fd.get("capacity") ?? 30) || 30,
      fee: Number(fd.get("fee") ?? 0) || 0,
      deadline: deadlineRaw ? new Date(deadlineRaw).toISOString() : null,
      status: String(fd.get("status") ?? "draft") as SeminarStatus,
    };

    const supabase = createClient();
    const { error: upErr } = await supabase
      .from("seminars")
      .update(payload)
      .eq("id", seminar.id);

    setLoading(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
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
        defaultValue={seminar.title}
      />
      <Textarea
        name="description"
        label="説明"
        required
        rows={8}
        defaultValue={seminar.description}
      />
      <Input
        name="date"
        label="開催日時"
        type="datetime-local"
        required
        defaultValue={toLocal(seminar.date)}
      />
      <Input name="venue" label="会場" required defaultValue={seminar.venue} />
      <Input
        name="instructor"
        label="講師"
        defaultValue={seminar.instructor ?? ""}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="capacity"
          label="定員"
          type="number"
          min={1}
          defaultValue={seminar.capacity}
        />
        <Input
          name="fee"
          label="参加費（円）"
          type="number"
          min={0}
          defaultValue={seminar.fee}
        />
      </div>
      <Input
        name="deadline"
        label="申込締切"
        type="datetime-local"
        defaultValue={seminar.deadline ? toLocal(seminar.deadline) : ""}
      />
      <Select
        name="status"
        label="ステータス"
        options={STATUS_OPTIONS}
        defaultValue={seminar.status}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={loading}>
          更新する
        </Button>
        <Link href="/admin/seminars">
          <Button type="button" variant="outline">
            一覧へ
          </Button>
        </Link>
      </div>
    </form>
  );
}
