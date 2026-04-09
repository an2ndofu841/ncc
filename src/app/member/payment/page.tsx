import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Member } from "@/lib/types";
import { MEMBER_TYPE_LABELS } from "@/lib/utils";
import { FEE_TABLE } from "@/lib/stripe-prices";
import PaymentButton from "./PaymentButton";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const sp = await searchParams;
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

  if (member.payment_status === "paid") {
    redirect("/member");
  }

  const fees = FEE_TABLE[member.member_type] ?? FEE_TABLE.regular;
  const typeName =
    MEMBER_TYPE_LABELS[member.member_type] ?? member.member_type;
  const initialTotal = fees.admission + fees.certification + fees.annual;

  return (
    <>
      <PageHeader
        title="入会金・年会費のお支払い"
        description="会員サービスをご利用いただくために、以下の決済をお願いいたします。"
        breadcrumbs={[
          { label: "会員ページ", href: "/member" },
          { label: "お支払い" },
        ]}
      />

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {sp.cancelled && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            決済がキャンセルされました。再度お手続きをお願いいたします。
          </div>
        )}

        <Card>
          <h2 className="text-lg font-bold text-primary-700">
            お支払い内容（{typeName}）
          </h2>

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
                <tr className="border-b border-neutral-100">
                  <td className="px-4 py-3 text-neutral-700">入会金</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-900">
                    {fees.admission.toLocaleString()}円
                  </td>
                </tr>
                {fees.certification > 0 && (
                  <tr className="border-b border-neutral-100">
                    <td className="px-4 py-3 text-neutral-700">
                      認定料（初回のみ）
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-900">
                      {fees.certification.toLocaleString()}円
                    </td>
                  </tr>
                )}
                <tr className="border-b border-neutral-100">
                  <td className="px-4 py-3 text-neutral-700">
                    年会費（初年度）
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-900">
                    {fees.annual.toLocaleString()}円
                  </td>
                </tr>
                <tr className="bg-primary-50">
                  <td className="px-4 py-3 font-bold text-primary-700">
                    初回お支払い合計
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-lg font-bold text-primary">
                    {initialTotal.toLocaleString()}円
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg bg-neutral-50 px-4 py-3 text-sm text-neutral-600 space-y-1">
            <p>
              <strong>クレジットカード</strong>の場合、翌年以降は年会費（
              <strong>{fees.annual.toLocaleString()}円/年</strong>
              ）が自動更新されます。
            </p>
            <p>
              <strong>コンビニ・銀行振込</strong>の場合は初回一括払いとなり、翌年以降は別途ご案内いたします。
            </p>
          </div>

          <div className="mt-8">
            <PaymentButton />
          </div>
        </Card>
      </div>
    </>
  );
}
