"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLE_OPTIONS = [
  { value: "office_staff", label: "事務局" },
  { value: "editor", label: "編集者" },
];

export default function NewStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    member_number: string;
    tempPassword?: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const name_kana = String(fd.get("name_kana") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const role = String(fd.get("role") ?? "");
    const password = String(fd.get("password") ?? "").trim();

    if (!name || !name_kana || !email || !role) {
      setError("必須項目を入力してください。");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/create-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          name_kana,
          email,
          role,
          ...(password ? { password } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "作成に失敗しました。");
        setLoading(false);
        return;
      }

      setResult({
        member_number: data.member_number,
        tempPassword: data.tempPassword,
      });
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <>
        <PageHeader
          title="アカウント作成完了"
          breadcrumbs={[
            { label: "管理画面", href: "/admin" },
            { label: "会員", href: "/admin/members" },
            { label: "新規作成" },
          ]}
        />
        <div className="mx-auto max-w-lg">
          <Card>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <svg
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  アカウントを作成しました
                </h2>
              </div>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-neutral-500">会員番号</dt>
                  <dd className="mt-0.5 text-neutral-900">
                    {result.member_number}
                  </dd>
                </div>
                {result.tempPassword && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <dt className="font-semibold text-amber-800">
                      仮パスワード（この画面を閉じると再表示できません）
                    </dt>
                    <dd className="mt-1 select-all font-mono text-base font-bold text-amber-900">
                      {result.tempPassword}
                    </dd>
                    <p className="mt-2 text-xs text-amber-700">
                      このパスワードを本人にお知らせください。初回ログイン後にパスワード変更を推奨します。
                    </p>
                  </div>
                )}
              </dl>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                >
                  続けて作成
                </Button>
                <Link href="/admin/members">
                  <Button type="button" variant="outline">
                    会員一覧へ
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="事務局・編集者アカウントの新規作成"
        description="事務局または編集者の管理アカウントを作成します。"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "会員", href: "/admin/members" },
          { label: "新規作成" },
        ]}
      />
      <div className="mx-auto max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <Input name="name" label="氏名" required />
          <Input name="name_kana" label="ふりがな" required />
          <Input name="email" label="メールアドレス" type="email" required />
          <Select
            name="role"
            label="権限"
            required
            placeholder="選択してください"
            options={ROLE_OPTIONS}
          />
          <Input
            name="password"
            label="パスワード"
            type="text"
            placeholder="未入力の場合は自動生成されます"
            helperText="8文字以上。空欄にすると安全なパスワードが自動生成され、作成後に表示されます。"
          />

          <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-4">
            <Button type="submit" loading={loading}>
              アカウントを作成
            </Button>
            <Link href="/admin/members">
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
