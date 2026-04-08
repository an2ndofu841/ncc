import MemberEditForm from "@/app/admin/members/[id]/MemberEditForm";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { createServiceClient } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";
import { formatDate, MEMBER_STATUS_LABELS, MEMBER_TYPE_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/utils";
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
          <span className="hidden sm:inline">|</span>
          <span>
            決済:{" "}
            <Badge
              variant={
                member.payment_status === "paid"
                  ? "success"
                  : member.payment_status === "overdue"
                    ? "warning"
                    : "default"
              }
            >
              {PAYMENT_STATUS_LABELS[member.payment_status] ?? member.payment_status ?? "—"}
            </Badge>
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
        {member.stripe_customer_id && (
          <Card className="text-sm text-neutral-600">
            <h3 className="font-semibold text-neutral-900">Stripe情報</h3>
            <dl className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-neutral-500">顧客ID</dt>
                <dd className="font-mono text-xs text-neutral-700">
                  {member.stripe_customer_id}
                </dd>
              </div>
              {member.stripe_subscription_id && (
                <div>
                  <dt className="text-xs text-neutral-500">サブスクリプションID</dt>
                  <dd className="font-mono text-xs text-neutral-700">
                    {member.stripe_subscription_id}
                  </dd>
                </div>
              )}
            </dl>
          </Card>
        )}
        <MemberEditForm member={member} />
      </div>
    </>
  );
}
