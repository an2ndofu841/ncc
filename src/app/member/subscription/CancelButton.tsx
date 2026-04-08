"use client";

import Button from "@/components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleCancel() {
    const confirmed = window.confirm(
      "年会費の自動更新を停止します。\n\n現在の有効期間中は引き続きサービスをご利用いただけます。\n本当に停止しますか？"
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/cancel", { method: "POST" });
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
      <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
        自動更新を停止しました。現在の有効期間中は引き続きサービスをご利用いただけます。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        loading={loading}
        onClick={handleCancel}
        className="border-red-300 text-red-600 hover:bg-red-50"
      >
        自動更新を停止する
      </Button>
    </div>
  );
}
