"use client";

import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";
import type { Application, ApplicationStatus } from "@/lib/types";
import {
  APPLICATION_STATUS_LABELS,
  MEMBER_TYPE_LABELS,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = Object.entries(APPLICATION_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

export default function ApplicationDetailClient({
  application,
  canApprove,
}: {
  application: Application;
  canApprove: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(application.status);
  const [adminNotes, setAdminNotes] = useState(application.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  async function saveMeta() {
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("applications")
      .update({
        status: status as ApplicationStatus,
        admin_notes: adminNotes.trim() || null,
      })
      .eq("id", application.id);
    setSaving(false);
    if (error) {
      setMessage("保存に失敗しました: " + error.message);
      return;
    }
    setMessage("保存しました。");
    router.refresh();
  }

  async function approveAndRegister() {
    const pwd = prompt(
      "新規会員のログイン用パスワードを入力してください（8文字以上推奨）。キャンセルで自動生成します。",
      ""
    );
    setApproving(true);
    setMessage(null);
    setTempPassword(null);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          password: pwd && pwd.length > 0 ? pwd : undefined,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        tempPassword?: string;
        memberId?: string;
      };
      if (!res.ok) {
        setMessage(json.error ?? "承認処理に失敗しました。");
        return;
      }
      if (json.tempPassword) {
        setTempPassword(json.tempPassword);
      }
      setMessage("承認し、会員登録と認証ユーザーを作成しました。");
      setStatus("approved");
      router.refresh();
    } catch {
      setMessage("通信エラーが発生しました。");
    } finally {
      setApproving(false);
    }
  }

  return (
    <div className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      {message && (
        <p
          className={
            message.startsWith("保存") || message.startsWith("承認")
              ? "rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800"
              : "rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {message}
        </p>
      )}
      {tempPassword && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          初回パスワード（会員へ安全な経路でお伝えください）:{" "}
          <code className="font-mono font-semibold">{tempPassword}</code>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="ステータス"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as ApplicationStatus)
          }
        />
      </div>
      <Textarea
        label="管理者メモ（内部用）"
        rows={4}
        value={adminNotes}
        onChange={(e) => setAdminNotes(e.target.value)}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={saveMeta} loading={saving}>
          ステータス・メモを保存
        </Button>
        {canApprove &&
          application.status !== "approved" &&
          application.status !== "rejected" && (
            <Button
              type="button"
              variant="secondary"
              loading={approving}
              onClick={() => {
                if (
                  !confirm(
                    "この申込みを承認し、会員レコードとログインアカウントを作成します。よろしいですか？"
                  )
                )
                  return;
                void approveAndRegister();
              }}
            >
              承認して会員登録
            </Button>
          )}
      </div>

      <div className="border-t border-neutral-100 pt-6 text-sm text-neutral-600">
        <p>
          希望会員種別:{" "}
          <strong className="text-neutral-900">
            {MEMBER_TYPE_LABELS[application.desired_member_type] ??
              application.desired_member_type}
          </strong>
        </p>
      </div>
    </div>
  );
}
