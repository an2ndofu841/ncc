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

const STAFF_RESTRICTED_STATUSES = new Set(["staff_approved", "approved"]);

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
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isAdmin = userRole === "system_admin";
  const isStaff = userRole === "office_staff";

  const statusOptions = Object.entries(APPLICATION_STATUS_LABELS)
    .filter(([value]) => isAdmin || !STAFF_RESTRICTED_STATUSES.has(value))
    .map(([value, label]) => ({ value, label }));
  const notTerminal =
    application.status !== "approved" && application.status !== "rejected";
  const canStaffApprove =
    isStaff && notTerminal && application.status !== "staff_approved";
  const canFinalApprove =
    isAdmin && notTerminal;

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
    setApproving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });
      const json = (await res.json()) as {
        error?: string;
        memberId?: string;
      };
      if (!res.ok) {
        setMessage(json.error ?? "最終承認に失敗しました。");
        return;
      }
      setMessage("最終承認が完了しました。会員にパスワード設定リンク付きのメールを送信しました。");
      setStatus("approved");
      router.refresh();
    } catch {
      setMessage("通信エラーが発生しました。");
    } finally {
      setApproving(false);
    }
  }

  async function resendEmail() {
    setResending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/resend-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error ?? "メールの再送に失敗しました。");
        return;
      }
      setMessage("承認メールを再送しました。");
    } catch {
      setMessage("通信エラーが発生しました。");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      {/* 承認フロー表示 */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-neutral-500">フロー：</span>
        <FlowStep label="申込受付" done={true} />
        <FlowArrow />
        {!isAdmin && (
          <>
            <FlowStep
              label="事務局承認"
              done={status === "staff_approved" || status === "approved"}
              active={canStaffApprove}
            />
            <FlowArrow />
          </>
        )}
        <FlowStep
          label="最終承認"
          done={status === "approved"}
          active={canFinalApprove}
        />
        <FlowArrow />
        <FlowStep
          label="決済"
          done={false}
          disabled={status !== "approved"}
          note={status === "approved" ? "会員側で手続き中" : undefined}
        />
        <FlowArrow />
        <FlowStep label="完了" done={false} disabled={status !== "approved"} />
      </div>

      {status === "approved" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <p className="font-semibold">承認済み — 決済待ち</p>
          <p className="mt-1 text-blue-700">
            会員にはログイン情報と決済案内のメールを送信済みです。
            ログイン後、Stripe決済画面で入会金・年会費を支払います。
            決済状況は<strong>会員管理</strong>で確認できます。
          </p>
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={resending}
              onClick={() => {
                if (!confirm("承認メール（ログイン情報・決済案内）を再送しますか？"))
                  return;
                void resendEmail();
              }}
            >
              承認メールを再送する
            </Button>
          </div>
        </div>
      )}

      {message && (
        <p
          className={
            message.startsWith("保存") || message.startsWith("事務局承認") || message.startsWith("最終承認") || message.startsWith("承認メール")
              ? "rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800"
              : "rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {message}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="ステータス"
          options={statusOptions}
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
  disabled,
  note,
}: {
  label: string;
  done: boolean;
  active?: boolean;
  disabled?: boolean;
  note?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        done
          ? "bg-emerald-100 text-emerald-800"
          : active
            ? "bg-blue-100 text-blue-800 ring-2 ring-blue-300"
            : disabled
              ? "bg-neutral-50 text-neutral-300"
              : "bg-neutral-100 text-neutral-500"
      }`}
      title={note}
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
