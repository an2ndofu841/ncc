"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = "パスワード再設定 | 全日本カイロプラクティック施術協同組合";
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <Card className="shadow-md">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-primary-700 sm:text-2xl">
            パスワード再設定
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            登録のメールアドレスに再設定用のリンクをお送りします。
          </p>
        </div>

        {sent ? (
          <div className="space-y-6 text-center">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
              <p className="font-medium">メールを送信しました</p>
              <p className="mt-2 text-emerald-800">
                入力いただいたアドレス宛に、パスワード再設定のご案内を送りました。メール内のリンクから手続きを完了してください。
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              ログイン画面に戻る
            </Link>
          </div>
        ) : (
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
              id="email"
              type="email"
              name="email"
              label="メールアドレス"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              再設定メールを送信
            </Button>

            <p className="text-center text-sm">
              <Link href="/auth/login" className="text-primary hover:underline">
                ログイン画面に戻る
              </Link>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
