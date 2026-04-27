import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Member } from "@/lib/types";
import { MEMBER_TYPE_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/utils";
import { FEE_TABLE } from "@/lib/stripe-prices";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import CancelButton from "./CancelButton";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: memberRow } = await supabase
    .from("members")
    .select("id, member_type, stripe_subscription_id, payment_status, renewal_date")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (!memberRow) redirect("/");
  const member = memberRow as Pick<Member, "id" | "member_type" | "stripe_subscription_id" | "payment_status" | "renewal_date">;

  const fees = FEE_TABLE[member.member_type] ?? FEE_TABLE.regular;
  const typeName =
    MEMBER_TYPE_LABELS[member.member_type] ?? member.member_type;
  const hasSubscription = Boolean(member.stripe_subscription_id);
  const isPaid = member.payment_status === "paid";
  const isCancelled = member.payment_status === "cancelled";

  return (
    <>
      <PageHeader
        title="年会費・サブスクリプション"
        description="年会費の自動更新状況と解約手続きができます。"
        breadcrumbs={[
          { label: "会員ページ", href: "/member" },
          { label: "年会費・サブスクリプション" },
        ]}
      />

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <h2 className="text-lg font-bold text-neutral-900">
            現在のプラン
          </h2>

          <dl className="mt-4 divide-y divide-neutral-100">
            <div className="flex justify-between py-3">
              <dt className="text-sm text-neutral-600">会員種別</dt>
              <dd className="text-sm font-semibold text-neutral-900">
                {typeName}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm text-neutral-600">年会費</dt>
              <dd className="text-sm font-semibold text-neutral-900">
                {fees.annual.toLocaleString()}円/年
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm text-neutral-600">決済ステータス</dt>
              <dd>
                <Badge
                  variant={
                    isPaid
                      ? "success"
                      : isCancelled
                        ? "warning"
                        : "default"
                  }
                >
                  {PAYMENT_STATUS_LABELS[member.payment_status] ??
                    member.payment_status ??
                    "—"}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm text-neutral-600">自動更新</dt>
              <dd className="text-sm font-semibold text-neutral-900">
                {isCancelled
                  ? "停止済み（次回更新で終了）"
                  : isPaid && hasSubscription
                    ? "有効"
                    : "—"}
              </dd>
            </div>
          </dl>
        </Card>

        {isPaid && hasSubscription && (
          <Card className="mt-6 border-red-100">
            <h3 className="text-base font-bold text-neutral-900">
              年会費の自動更新を停止する
            </h3>
            <div className="mt-3 space-y-3 text-sm text-neutral-600">
              <p>
                自動更新を停止すると、<strong>現在の有効期間が満了するまで</strong>は引き続き会員サービスをご利用いただけます。
                満了後は会員サービスへのアクセスが制限されます。
              </p>
              <p>
                再入会をご希望の場合は、事務局までお問い合わせください。
              </p>
            </div>
            <div className="mt-6">
              <CancelButton />
            </div>
          </Card>
        )}

        {isCancelled && (
          <Card className="mt-6 border-amber-200 bg-amber-50">
            <p className="text-sm font-semibold text-amber-800">
              自動更新が停止されています
            </p>
            <p className="mt-1 text-sm text-amber-700">
              現在の有効期間が終了するまで会員サービスをご利用いただけます。
              再開をご希望の場合は、事務局（info@ncc-chiro.or.jp）までお問い合わせください。
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
