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
  userRole,
}: {
  application: Application;
  userRole: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(application.status);
  const [adminNotes, setAdminNotes] = useState(application.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const isAdmin = userRole === "system_admin";
  const isStaff = userRole === "office_staff";
  const canStaffApprove = (isAdmin || isStaff) &&
    application.status !== "approved" &&
    application.status !== "staff_approved" &&
    application.status !== "rejected";
  const canFinalApprove = isAdmin && application.status === "staff_approved";

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

  async function staffApprove() {
    setApproving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/staff-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error ?? "事務局承認に失敗しました。");
        return;
      }
      setMessage("事務局承認が完了しました。システム管理者の最終承認をお待ちください。");
      setStatus("staff_approved");
      router.refresh();
    } catch {
      setMessage("通信エラーが発生しました。");
    } finally {
      setApproving(false);
    }
  }

  async function finalApprove() {
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
        setMessage(json.error ?? "最終承認に失敗しました。");
        return;
      }
      if (json.tempPassword) {
        setTempPassword(json.tempPassword);
      }
      setMessage("最終承認が完了しました。会員登録とログインアカウントを作成しました。");
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
      {/* 承認フロー表示 */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-neutral-500">承認フロー：</span>
        <FlowStep label="申込受付" done={true} />
        <FlowArrow />
        <FlowStep
          label="事務局承認"
          done={status === "staff_approved" || status === "approved"}
          active={canStaffApprove}
        />
        <FlowArrow />
        <FlowStep
          label="最終承認"
          done={status === "approved"}
          active={canFinalApprove}
        />
      </div>

      {message && (
        <p
          className={
            message.startsWith("保存") || message.startsWith("事務局承認") || message.startsWith("最終承認")
              ? "rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800"
              : "rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {message}
        </p>
      )}
      {tempPassword && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            初回パスワード（この画面を閉じると再表示できません）
          </p>
          <p className="mt-1 select-all font-mono text-base font-bold text-amber-900">
            {tempPassword}
          </p>
          <p className="mt-2 text-xs text-amber-700">
            会員へ安全な経路でお伝えください。
          </p>
        </div>
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

        {canStaffApprove && (
          <Button
            type="button"
            variant="secondary"
            loading={approving}
            onClick={() => {
              if (!confirm("この申込みを事務局として承認します。よろしいですか？"))
                return;
              void staffApprove();
            }}
          >
            事務局承認
          </Button>
        )}

        {canFinalApprove && (
          <Button
            type="button"
            variant="secondary"
            loading={approving}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => {
              if (
                !confirm(
                  "最終承認を行い、会員レコードとログインアカウントを作成します。よろしいですか？"
                )
              )
                return;
              void finalApprove();
            }}
          >
            最終承認して会員登録
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

function FlowStep({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        done
          ? "bg-emerald-100 text-emerald-800"
          : active
            ? "bg-blue-100 text-blue-800 ring-2 ring-blue-300"
            : "bg-neutral-100 text-neutral-500"
      }`}
    >
      {done && (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {label}
    </span>
  );
}

function FlowArrow() {
  return (
    <svg className="h-4 w-4 shrink-0 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
