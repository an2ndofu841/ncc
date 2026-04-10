"use client";

import Button from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CheckPaymentButton({
  sessionId,
  autoCheck = false,
}: {
  sessionId: string;
  autoCheck?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
        setMessage("決済が確認されました。ページを更新します…");
        setTimeout(() => router.push("/member"), 1500);
      } else {
        setMessage("まだ入金が確認されていません。しばらくしてから再度お試しください。");
      }
    } catch {
      setMessage("確認に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    if (autoCheck) {
      handleCheck();
    }
  }, [autoCheck, handleCheck]);

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
