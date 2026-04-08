"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import type { Member } from "@/lib/types";
import {
  MEMBER_STATUS_LABELS,
  MEMBER_TYPE_LABELS,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const profileSchema = z.object({
  phone: z.string().min(1, "電話番号を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  postal_code: z.string().min(1, "郵便番号を入力してください"),
  address: z.string().min(1, "住所を入力してください"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  member: Member;
}

export default function ProfileForm({ member }: ProfileFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: member.phone,
      email: member.email,
      postal_code: member.postal_code,
      address: member.address,
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    setSubmitError(null);
    setSuccess(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("members")
      .update({
        phone: values.phone,
        email: values.email,
        postal_code: values.postal_code,
        address: values.address,
      })
      .eq("id", member.id);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    const { error: authEmailError } = await supabase.auth.updateUser({
      email: values.email,
    });
    if (authEmailError) {
      setSubmitError(
        `会員情報は更新しましたが、ログイン用メールの更新でエラーが発生しました: ${authEmailError.message}`
      );
      router.refresh();
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  async function sendPasswordReset() {
    setResetMessage(null);
    setSendingReset(true);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`;
      const { error } = await supabase.auth.resetPasswordForEmail(
        member.email,
        { redirectTo }
      );
      if (error) {
        setResetMessage(`送信に失敗しました: ${error.message}`);
        return;
      }
      setResetMessage(
        "パスワード再設定用のメールを送信しました。メール内のリンクから手続きしてください。"
      );
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <h2 className="text-lg font-bold text-primary-700">会員情報</h2>
        <p className="mt-1 text-sm text-neutral-500">
          氏名の変更が必要な場合は、事務局までお問い合わせください。
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-neutral-500">会員番号</dt>
            <dd className="mt-1 text-sm font-semibold text-neutral-900">
              {member.member_number}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-neutral-500">氏名</dt>
            <dd className="mt-1 text-sm font-semibold text-neutral-900">
              {member.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-neutral-500">会員種別</dt>
            <dd className="mt-1 text-sm text-neutral-800">
              {MEMBER_TYPE_LABELS[member.member_type] ?? member.member_type}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-neutral-500">ステータス</dt>
            <dd className="mt-1 text-sm text-neutral-800">
              {MEMBER_STATUS_LABELS[member.status] ?? member.status}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-primary-700">連絡先・住所の編集</h2>
        <p className="mt-1 text-sm text-neutral-500">
          変更後は画面下部のボタンから保存してください。
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          {submitError && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {submitError}
            </div>
          )}
          {success && (
            <div
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              role="status"
            >
              会員情報を更新しました。
            </div>
          )}

          <Input
            id="phone"
            label="電話番号"
            type="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            id="email"
            label="メールアドレス"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            id="postal_code"
            label="郵便番号"
            autoComplete="postal-code"
            error={errors.postal_code?.message}
            {...register("postal_code")}
          />
          <Input
            id="address"
            label="住所"
            autoComplete="street-address"
            error={errors.address?.message}
            {...register("address")}
          />

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" loading={isSubmitting}>
              変更を保存
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-primary-700">パスワード</h2>
        <p className="mt-1 text-sm text-neutral-500">
          ログイン中にパスワードを変更する場合と、メールで再設定する場合があります。
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <Link
            href="/auth/update-password"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            パスワードを変更（ログイン中）
          </Link>
          <Button
            type="button"
            variant="outline"
            loading={sendingReset}
            onClick={sendPasswordReset}
          >
            再設定メールを送信
          </Button>
        </div>
        {resetMessage && (
          <p className="mt-4 text-sm text-neutral-600">{resetMessage}</p>
        )}
      </Card>
    </div>
  );
}
