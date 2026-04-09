"use client";

import Button from "@/components/ui/Button";
import { CreditCard, Building2, Store, Smartphone, Wallet } from "lucide-react";
import { useState } from "react";

type PaymentMethod = "card" | "konbini" | "bank_transfer" | "paypay";

const METHODS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof CreditCard;
}[] = [
  {
    id: "card",
    label: "カード / Apple Pay / Google Pay",
    description: "年会費は自動更新されます",
    icon: Wallet,
  },
  {
    id: "paypay",
    label: "PayPay",
    description: "初回一括払い・翌年以降は別途ご案内",
    icon: Smartphone,
  },
  {
    id: "konbini",
    label: "コンビニ払い",
    description: "初回一括払い・翌年以降は別途ご案内",
    icon: Store,
  },
  {
    id: "bank_transfer",
    label: "銀行振込",
    description: "初回一括払い・翌年以降は別途ご案内",
    icon: Building2,
  },
];

export default function PaymentButton() {
  const [selected, setSelected] = useState<PaymentMethod>("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: selected }),
      });
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
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-semibold text-neutral-700">
          お支払い方法を選択
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {METHODS.map((m) => {
            const Icon = m.icon;
            const isActive = selected === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-center transition-all ${
                  isActive
                    ? "border-primary bg-primary-50 shadow-sm"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${isActive ? "text-primary" : "text-neutral-400"}`}
                />
                <span
                  className={`text-sm font-semibold ${isActive ? "text-primary" : "text-neutral-700"}`}
                >
                  {m.label}
                </span>
                <span className="text-[11px] leading-tight text-neutral-500">
                  {m.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

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
        お支払いへ進む
      </Button>
      <p className="text-center text-xs text-neutral-500">
        安全な決済ページ（Stripe）に移動します。
      </p>
    </div>
  );
}
