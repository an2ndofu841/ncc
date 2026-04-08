"use client";

import Button from "@/components/ui/Button";
import { useState } from "react";

export default function PaymentButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? "決済セッションの作成に失敗しました。");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
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
        loading={loading}
        onClick={handleClick}
        className="w-full text-base"
      >
        お支払いへ進む（Stripe）
      </Button>
      <p className="text-center text-xs text-neutral-500">
        安全な決済ページ（Stripe）に移動します。
        クレジットカードで決済いただけます。
      </p>
    </div>
  );
}
