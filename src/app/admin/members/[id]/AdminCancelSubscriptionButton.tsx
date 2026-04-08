"use client";

import Button from "@/components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCancelSubscriptionButton({
  memberId,
}: {
  memberId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleCancel() {
    const confirmed = window.confirm(
      "この会員のサブスクリプション（年会費自動更新）を停止します。\n本当に停止しますか？"
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "解約処理に失敗しました。");
        return;
      }

      setDone(true);
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        自動更新を停止しました。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={loading}
        onClick={handleCancel}
        className="border-red-300 text-red-600 hover:bg-red-50"
      >
        自動更新を停止する
      </Button>
    </div>
  );
}
