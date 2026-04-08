import MembersTableClient from "@/app/admin/members/MembersTableClient";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { createServiceClient } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";
import Link from "next/link";

export default async function AdminMembersPage() {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Card>
        <p className="text-red-600">
          会員一覧の取得に失敗しました。権限をご確認ください。
        </p>
      </Card>
    );
  }

  const members = (data ?? []) as Member[];

  return (
    <>
      <PageHeader
        title="会員管理"
        description="登録会員の検索・詳細確認ができます。"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "会員" },
        ]}
      />
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex justify-end">
          <Link
            href="/admin/members/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            + 事務局・編集者を追加
          </Link>
        </div>
        <MembersTableClient members={members} />
      </div>
    </>
  );
}
