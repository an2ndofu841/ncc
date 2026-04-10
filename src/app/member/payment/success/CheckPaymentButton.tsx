"use client";

import Button from "@/components/ui/Button";
import { CheckCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function CheckPaymentButton({
  sessionId,
  autoCheck = false,
}: {
  sessionId: string;
  autoCheck?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCheck = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/stripe/check-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const json = await res.json();

      if (json.status === "paid") {
        setConfirmed(true);
        setMessage("決済が確認されました。会員ページへ移動します…");
        setTimeout(() => {
          window.location.href = "/member";
        }, 1200);
      } else {
        setMessage("まだ入金が確認されていません。しばらくしてから再度お試しください。");
      }
    } catch {
      setMessage("確認に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (autoCheck) {
      handleCheck();
    }
  }, [autoCheck, handleCheck]);

  if (confirmed) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <CheckCircle className="h-5 w-5 text-green-600 animate-pulse" />
        <p className="text-sm font-semibold text-green-800">
          決済が確認されました。会員ページへ移動します…
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={loading}
        onClick={handleCheck}
      >
        <RefreshCw className="mr-1.5 h-4 w-4" />
        入金状況を確認する
      </Button>
      {message && (
        <p className="text-sm text-neutral-600">{message}</p>
      )}
    </div>
  );
}
