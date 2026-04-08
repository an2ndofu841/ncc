import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Member } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { getStripe } from "@/lib/stripe";

async function verifyAndUpdatePayment(
  memberId: string,
  sessionId: string | null
) {
  if (!sessionId) return false;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const service = await createServiceClient();
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : null;

      await service
        .from("members")
        .update({
          payment_status: "paid",
          ...(subscriptionId
            ? { stripe_subscription_id: subscriptionId }
            : {}),
        })
        .eq("id", memberId);

      return true;
    }
  } catch (err) {
    console.error("Failed to verify checkout session:", err);
  }
  return false;
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

  if (paymentStatus !== "paid" && sp.session_id) {
    const verified = await verifyAndUpdatePayment(
      memberRow.id,
      sp.session_id
    );
    if (verified) paymentStatus = "paid";
  }

  return (
    <>
      <PageHeader
        title="決済完了"
        breadcrumbs={[
          { label: "会員ページ", href: "/member" },
          { label: "決済完了" },
        ]}
      />

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Card className="text-center">
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
