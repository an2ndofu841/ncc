import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Member } from "@/lib/types";
import { MEMBER_TYPE_LABELS } from "@/lib/utils";
import { FEE_TABLE } from "@/lib/stripe-prices";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import RenewalPaymentButton from "./RenewalPaymentButton";

export default async function RenewalPaymentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: memberRow } = await supabase
    .from("members")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (!memberRow) redirect("/");
  const member = memberRow as Member;

  const fees = FEE_TABLE[member.member_type] ?? FEE_TABLE.regular;
  const typeName =
    MEMBER_TYPE_LABELS[member.member_type] ?? member.member_type;

  const renewalDate = member.renewal_date
    ? new Date(member.renewal_date).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <>
      <PageHeader
        title="年会費の更新"
        description="年会費をお支払いいただくと、会員期間が1年間延長されます。"
        breadcrumbs={[
          { label: "会員ページ", href: "/member" },
          { label: "年会費・契約", href: "/member/subscription" },
          { label: "年会費の更新" },
        ]}
      />

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <h2 className="text-lg font-bold text-primary-700">
            お支払い内容（{typeName}）
          </h2>

          <div className="mt-4 rounded-lg bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            現在の更新日: <strong>{renewalDate}</strong>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-4 py-3 text-left font-semibold text-neutral-700">
                    項目
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-neutral-700">
                    金額（税込）
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-primary-50">
                  <td className="px-4 py-3 font-bold text-primary-700">
                    年会費
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-lg font-bold text-primary">
                    {fees.annual.toLocaleString()}円
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <RenewalPaymentButton />
          </div>
        </Card>
      </div>
    </>
  );
}
