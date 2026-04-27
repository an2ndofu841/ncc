import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { CheckCircle, Clock } from "lucide-react";
import { getStripe } from "@/lib/stripe";

async function verifyRenewalPayment(memberId: string, sessionId: string | null) {
  if (!sessionId) return { verified: false, pending: false };

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.member_id !== memberId) {
      return { verified: false, pending: false };
    }

    if (session.payment_status === "paid") {
      const service = await createServiceClient();
      const renewalDate = new Date();
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);

      await service
        .from("members")
        .update({
          payment_status: "paid",
          renewal_date: renewalDate.toISOString().slice(0, 10),
        })
        .eq("id", memberId);

      return { verified: true, pending: false };
    }

    if (session.payment_status === "unpaid") {
      return { verified: false, pending: true };
    }
  } catch (err) {
    console.error("Failed to verify renewal session:", err);
  }
  return { verified: false, pending: false };
}

export default async function RenewalSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: memberRow } = await supabase
    .from("members")
    .select("id, payment_status")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (!memberRow) redirect("/");

  const result = await verifyRenewalPayment(memberRow.id, sp.session_id ?? null);

  return (
    <>
      <PageHeader
        title={result.pending ? "お支払い手続き受付" : "年会費のお支払い完了"}
        breadcrumbs={[
          { label: "会員ページ", href: "/member" },
          { label: result.pending ? "お支払い手続き受付" : "更新完了" },
        ]}
      />
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Card className="text-center">
          {result.pending ? (
            <>
              <div className="flex justify-center">
                <Clock className="h-16 w-16 text-amber-500" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-neutral-900">
                お支払い手続きを受け付けました
              </h2>
              <p className="mt-3 text-sm text-neutral-600">
                入金確認後、自動的に会員期間が更新されます。
                反映まで最大1〜2営業日かかる場合があります。
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-emerald-500" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-neutral-900">
                年会費のお支払いが完了しました
              </h2>
              <p className="mt-3 text-sm text-neutral-600">
                会員期間が1年間更新されました。引き続き会員サービスをご利用いただけます。
              </p>
            </>
          )}

          <div className="mt-8">
            <Link
              href="/member"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              マイページへ
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
