"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";
import type { Member, MemberRole, MemberStatus, MemberType } from "@/lib/types";
import {
  MEMBER_STATUS_LABELS,
  MEMBER_TYPE_LABELS,
} from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLE_LABELS: Record<MemberRole, string> = {
  system_admin: "システム管理者",
  office_staff: "事務局",
  editor: "編集者",
  member: "一般会員",
};

const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as MemberRole[]).map(
  (value) => ({ value, label: ROLE_LABELS[value] })
);

const TYPE_OPTIONS = Object.entries(MEMBER_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

const STATUS_OPTIONS = Object.entries(MEMBER_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

export default function MemberEditForm({ member }: { member: Member }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAuth = Boolean(member.auth_id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      name_kana: String(fd.get("name_kana") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      postal_code: String(fd.get("postal_code") ?? "").trim(),
      address: String(fd.get("address") ?? "").trim(),
      clinic_name: String(fd.get("clinic_name") ?? "").trim() || null,
      prefecture: String(fd.get("prefecture") ?? "").trim() || null,
      member_type: String(fd.get("member_type") ?? "") as MemberType,
      role: String(fd.get("role") ?? "") as MemberRole,
      status: String(fd.get("status") ?? "") as MemberStatus,
      qualifications: String(fd.get("qualifications") ?? "").trim() || null,
      practice_years: fd.get("practice_years")
        ? Number(fd.get("practice_years"))
        : null,
      business_hours: String(fd.get("business_hours") ?? "").trim() || null,
      service_area: String(fd.get("service_area") ?? "").trim() || null,
      description: String(fd.get("description") ?? "").trim() || null,
      referrer_name: String(fd.get("referrer_name") ?? "").trim() || null,
      notes: String(fd.get("notes") ?? "").trim() || null,
      is_public: fd.get("is_public") === "on",
    };

    const supabase = createClient();
    const { error: upErr } = await supabase
      .from("members")
      .update(payload)
      .eq("id", member.id);

    setLoading(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-neutral-900">
          管理者設定
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            name="role"
            label="権限ロール"
            options={ROLE_OPTIONS}
            defaultValue={member.role}
            required
          />
          <Select
            name="status"
            label="会員ステータス"
            options={STATUS_OPTIONS}
            defaultValue={member.status}
            required
          />
          <Select
            name="member_type"
            label="会員種別"
            options={TYPE_OPTIONS}
            defaultValue={member.member_type}
            required
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_public"
              defaultChecked={member.is_public}
              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            会員検索に公開する
          </label>
        </div>
        <p className="text-sm text-neutral-600">
          ログイン連携:{" "}
          <span className="font-medium text-neutral-900">
            {hasAuth
              ? "Supabase 認証と連携済み（ログイン可能）"
              : "未連携（承認フローでアカウント作成後に連携されます）"}
          </span>
        </p>
      </section>

      <section className="space-y-4 border-t border-neutral-100 pt-6">
        <h2 className="text-base font-semibold text-neutral-900">基本情報</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="会員番号"
            value={member.member_number}
            readOnly
            className="bg-neutral-50"
          />
          <Input name="name" label="氏名" required defaultValue={member.name} />
          <Input
            name="name_kana"
            label="ふりがな"
            required
            defaultValue={member.name_kana}
          />
          <Input
            name="email"
            label="メールアドレス"
            type="email"
            required
            defaultValue={member.email}
          />
          <Input name="phone" label="電話番号" defaultValue={member.phone} />
          <Input
            name="postal_code"
            label="郵便番号"
            defaultValue={member.postal_code}
          />
        </div>
        <Input name="address" label="住所" defaultValue={member.address} />
        <Input
          name="clinic_name"
          label="施術所・勤務先名"
          defaultValue={member.clinic_name ?? ""}
        />
        <Input
          name="prefecture"
          label="都道府県"
          defaultValue={member.prefecture ?? ""}
        />
        <Input
          name="referrer_name"
          label="紹介者"
          defaultValue={member.referrer_name ?? ""}
          helperText="入会時に紹介された方のお名前"
        />
      </section>

      <section className="space-y-4 border-t border-neutral-100 pt-6">
        <h2 className="text-base font-semibold text-neutral-900">詳細</h2>
        <Textarea
          name="qualifications"
          label="資格・経歴"
          rows={3}
          defaultValue={member.qualifications ?? ""}
        />
        <Input
          name="practice_years"
          label="実務年数"
          type="number"
          min={0}
          defaultValue={member.practice_years ?? ""}
        />
        <Input
          name="business_hours"
          label="営業時間"
          defaultValue={member.business_hours ?? ""}
        />
        <Input
          name="service_area"
          label="対応エリア"
          defaultValue={member.service_area ?? ""}
        />
        <Textarea
          name="description"
          label="自己紹介"
          rows={4}
          defaultValue={member.description ?? ""}
        />
        <Textarea
          name="notes"
          label="管理者メモ"
          rows={3}
          defaultValue={member.notes ?? ""}
        />
      </section>

      <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-6">
        <Button type="submit" loading={loading}>
          変更を保存
        </Button>
        <Link href="/admin/members">
          <Button type="button" variant="outline">
            一覧へ戻る
          </Button>
        </Link>
      </div>
    </form>
  );
}
