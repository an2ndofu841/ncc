import MemberEditForm from "@/app/admin/members/[id]/MemberEditForm";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { createServiceClient } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";
import { formatDate, MEMBER_STATUS_LABELS, MEMBER_TYPE_LABELS } from "@/lib/utils";
import { notFound } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
  system_admin: "システム管理者",
  office_staff: "事務局",
  editor: "編集者",
  member: "一般会員",
};

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const member = data as Member;

  return (
    <>
      <PageHeader
        title="会員詳細・編集"
        description={`${member.name}（${member.member_number}）`}
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "会員", href: "/admin/members" },
          { label: member.member_number },
        ]}
      />
      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="flex flex-wrap gap-3 text-sm text-neutral-600">
          <span>
            登録日:{" "}
            <strong className="text-neutral-900">
              {formatDate(member.created_at)}
            </strong>
          </span>
          <span className="hidden sm:inline">|</span>
          <span>
            種別:{" "}
            <Badge variant="info">
              {MEMBER_TYPE_LABELS[member.member_type] ?? member.member_type}
            </Badge>
          </span>
          <span>
            ステータス:{" "}
            <Badge variant="default">
              {MEMBER_STATUS_LABELS[member.status] ?? member.status}
            </Badge>
          </span>
          <span>
            権限:{" "}
            <strong className="text-neutral-900">
              {ROLE_LABELS[member.role] ?? member.role}
            </strong>
          </span>
          {member.referrer_name && (
            <>
              <span className="hidden sm:inline">|</span>
              <span>
                紹介者:{" "}
                <strong className="text-neutral-900">
                  {member.referrer_name}
                </strong>
              </span>
            </>
          )}
        </Card>
        <MemberEditForm member={member} />
      </div>
    </>
  );
}
