"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title =
      "パスワードの設定 | 全日本カイロプラクティック施術協同組合";
  }, []);

  if (!token) {
    return (
      <Card className="shadow-md text-center">
        <p className="text-red-700">
          無効なリンクです。メールのリンクを再度ご確認ください。
        </p>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。");
      return;
    }
    if (password !== confirm) {
      setError("パスワードが一致しません。");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "エラーが発生しました。");
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: json.email,
        password,
      });

      if (signInError) {
        setSuccess(true);
        return;
      }

      router.push("/member");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="shadow-md text-center">
        <div className="flex justify-center">
          <svg
            className="h-16 w-16 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-bold text-neutral-900">
          パスワードを設定しました
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          設定したパスワードでログインしてください。
        </p>
        <Button
          type="button"
          className="mt-6"
          onClick={() => router.push("/auth/login")}
        >
          ログインページへ
        </Button>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-primary-700 sm:text-2xl">
          パスワードの設定
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          会員ポータルにログインするためのパスワードを設定してください。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        <Input
          id="password"
          type="password"
          name="password"
          label="パスワード"
          autoComplete="new-password"
          required
          helperText="8文字以上で設定してください。"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          id="confirm"
          type="password"
          name="confirm"
          label="パスワード（確認）"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          パスワードを設定してログイン
        </Button>
      </form>
    </Card>
  );
}

export default function SetupAccountPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <Card className="shadow-md text-center">
            <p className="text-neutral-500">読み込み中...</p>
          </Card>
        }
      >
        <SetupForm />
      </Suspense>
    </div>
  );
}
