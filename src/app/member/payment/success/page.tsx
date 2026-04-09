import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Member } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { CheckCircle, Clock } from "lucide-react";
import { getStripe } from "@/lib/stripe";
import CheckPaymentButton from "./CheckPaymentButton";

async function verifyAndUpdatePayment(
  memberId: string,
  sessionId: string | null
) {
  if (!sessionId) return { verified: false, pending: false };

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const service = await createServiceClient();
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : null;

      const renewalDate = new Date();
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);

      await service
        .from("members")
        .update({
          payment_status: "paid",
          renewal_date: renewalDate.toISOString().slice(0, 10),
          ...(subscriptionId
            ? { stripe_subscription_id: subscriptionId }
            : {}),
        })
        .eq("id", memberId);

      return { verified: true, pending: false };
    }

    if (session.payment_status === "unpaid") {
      return { verified: false, pending: true };
    }
  } catch (err) {
    console.error("Failed to verify checkout session:", err);
  }
  return { verified: false, pending: false };
}

export default async function PaymentSuccessPage({
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
  let paymentStatus = (memberRow as Pick<Member, "id" | "payment_status">)
    .payment_status;

  let asyncPending = false;

  if (paymentStatus !== "paid" && sp.session_id) {
    const result = await verifyAndUpdatePayment(memberRow.id, sp.session_id);
    if (result.verified) paymentStatus = "paid";
    asyncPending = result.pending;
  }

  return (
    <>
      <PageHeader
        title={asyncPending ? "お支払い手続き受付" : "決済完了"}
        breadcrumbs={[
          { label: "会員ページ", href: "/member" },
          { label: asyncPending ? "お支払い手続き受付" : "決済完了" },
        ]}
      />

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Card className="text-center">
          {asyncPending ? (
            <>
              <div className="flex justify-center">
                <Clock className="h-16 w-16 text-amber-500" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-neutral-900">
                お支払い手続きを受け付けました
              </h2>
              <div className="mt-3 space-y-2 text-sm text-neutral-600">
                <p>
                  コンビニまたは銀行振込でのお支払い手続きが受け付けられました。
                </p>
                <p>
                  <strong>コンビニ払い</strong>の場合は、表示された支払い番号で
                  お近くのコンビニにてお支払いください。
                </p>
                <p>
                  <strong>銀行振込</strong>の場合は、Stripeから届くメールに記載の
                  口座情報に振込をお願いいたします。
                </p>
                <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-amber-800">
                  入金確認後、自動的に会員サービスが有効になります。
                  反映まで最大1〜2営業日かかる場合があります。
                </p>
              </div>
              {sp.session_id && (
                <CheckPaymentButton sessionId={sp.session_id} />
              )}
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-emerald-500" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-neutral-900">
                お支払いが完了しました
              </h2>

              {paymentStatus === "paid" ? (
                <p className="mt-3 text-sm text-neutral-600">
                  決済が正常に処理されました。会員専用サービスをご利用いただけます。
                </p>
              ) : (
                <p className="mt-3 text-sm text-neutral-600">
                  決済処理を確認中です。しばらくお待ちください。
                  <br />
                  通常、数分以内に反映されます。反映後、会員専用サービスをご利用いただけます。
                </p>
              )}
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
