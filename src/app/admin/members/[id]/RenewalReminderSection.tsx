"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Mail, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const REMINDER_TYPE_LABELS: Record<string, string> = {
  auto_30d: "自動（30日前）",
  auto_7d: "自動（7日前）",
  auto_1d: "自動（1日前）",
  auto_overdue: "自動（期限超過）",
  manual: "手動送信",
};

interface Reminder {
  id: string;
  sent_at: string;
  reminder_type: string;
  email_to: string;
}

interface Props {
  memberId: string;
  renewalDate: string | null;
  hasSubscription: boolean;
  reminders: Reminder[];
}

export default function RenewalReminderSection({
  memberId,
  renewalDate,
  hasSubscription,
  reminders,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!renewalDate) return null;

  const rd = new Date(renewalDate);
  const daysLeft = Math.ceil(
    (rd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const dateStr = rd.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleSendReminder() {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/send-renewal-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "送信に失敗しました。");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">
          年会費更新情報
        </h3>
        <Badge
          variant={
            daysLeft <= 0 ? "error" : daysLeft <= 30 ? "warning" : "success"
          }
        >
          {daysLeft <= 0
            ? `${Math.abs(daysLeft)}日超過`
            : `あと${daysLeft}日`}
        </Badge>
      </div>

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-neutral-500">更新日</dt>
          <dd
            className={`font-semibold ${daysLeft <= 0 ? "text-red-600" : daysLeft <= 30 ? "text-amber-600" : "text-neutral-900"}`}
          >
            {dateStr}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">更新方法</dt>
          <dd className="font-medium text-neutral-900">
            {hasSubscription ? "カード自動更新" : "手動（振込等）"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">案内メール送信回数</dt>
          <dd className="font-medium text-neutral-900">{reminders.length}回</dd>
        </div>
      </dl>

      {!hasSubscription && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            loading={loading}
            onClick={handleSendReminder}
          >
            <Mail className="mr-1.5 h-4 w-4" />
            更新案内メールを送信
          </Button>
          {success && (
            <span className="text-sm text-green-700">送信しました</span>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      )}

      {reminders.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-neutral-500">
            送信履歴
          </p>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-neutral-100">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-neutral-50">
                <tr>
                  <th className="px-3 py-1.5 text-left font-medium text-neutral-500">
                    日時
                  </th>
                  <th className="px-3 py-1.5 text-left font-medium text-neutral-500">
                    種別
                  </th>
                  <th className="px-3 py-1.5 text-left font-medium text-neutral-500">
                    送信先
                  </th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-neutral-50"
                  >
                    <td className="px-3 py-1.5 text-neutral-700">
                      {new Date(r.sent_at).toLocaleString("ja-JP", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-1.5">
                      <Badge
                        variant={
                          r.reminder_type === "manual" ? "info" : "default"
                        }
                      >
                        {REMINDER_TYPE_LABELS[r.reminder_type] ??
                          r.reminder_type}
                      </Badge>
                    </td>
                    <td className="px-3 py-1.5 text-neutral-600">
                      {r.email_to}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
