"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/member";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "ログイン | 全日本カイロプラクティック施術協同組合";
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signError) {
        setError(
          signError.message === "Invalid login credentials"
            ? "メールアドレスまたはパスワードが正しくありません。"
            : signError.message
        );
        return;
      }
      router.push(redirectTo.startsWith("/") ? redirectTo : "/member");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <Card className="shadow-md">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-primary-700 sm:text-2xl">
            会員ログイン
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            登録済みのメールアドレスとパスワードでログインしてください。
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
            id="email"
            type="email"
            name="email"
            label="メールアドレス"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            id="password"
            type="password"
            name="password"
            label="パスワード"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            ログイン
          </Button>
        </form>

        <div className="mt-6 space-y-3 border-t border-neutral-100 pt-6 text-center text-sm">
          <p>
            <Link
              href="/auth/reset-password"
              className="font-medium text-primary hover:underline"
            >
              パスワードをお忘れの方
            </Link>
          </p>
          <p className="text-neutral-600">
            会員登録はお済みでない方は{" "}
            <Link href="/apply" className="font-medium text-primary hover:underline">
              入会申込みフォーム
            </Link>
            からお申し込みください。
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 text-center text-neutral-500">
          読み込み中…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
