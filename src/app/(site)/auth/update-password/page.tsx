"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "新しいパスワードの設定 | 全日本カイロプラクティック施術協同組合";
  }, []);

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
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.push("/member");
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
            新しいパスワードの設定
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            新しいパスワードを入力し、確定してください。
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
            label="新しいパスワード"
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
            パスワードを更新
          </Button>
        </form>
      </Card>
    </div>
  );
}
