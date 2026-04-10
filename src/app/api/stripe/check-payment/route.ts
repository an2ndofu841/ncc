import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

async function updateMemberPaid(
  service: Awaited<ReturnType<typeof createServiceClient>>,
  memberId: string,
  extra: Record<string, unknown> = {}
) {
  const { error } = await service
    .from("members")
    .update({ payment_status: "paid", ...extra })
    .eq("id", memberId);

  if (error && Object.keys(extra).length > 0) {
    console.warn("Full update failed, falling back to payment_status only:", error.message);
    await service
      .from("members")
      .update({ payment_status: "paid" })
      .eq("id", memberId);
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const { sessionId } = await req.json();
  if (!sessionId) {
    return NextResponse.json(
      { error: "セッションIDが必要です。" },
      { status: 400 }
    );
  }

  const service = await createServiceClient();
  const { data: member } = await service
    .from("members")
    .select("id, payment_status")
    .eq("auth_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json(
      { error: "会員情報が見つかりません。" },
      { status: 404 }
    );
  }

  if (member.payment_status === "paid") {
    return NextResponse.json({ status: "paid" });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : null;

      const renewalDate = new Date();
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);

      await updateMemberPaid(service, member.id, {
        renewal_date: renewalDate.toISOString().slice(0, 10),
        ...(subscriptionId
          ? { stripe_subscription_id: subscriptionId }
          : {}),
      });

      return NextResponse.json({ status: "paid" });
    }

    return NextResponse.json({ status: session.payment_status ?? "unpaid" });
  } catch (err) {
    console.error("Check payment error:", err);
    return NextResponse.json({ status: "unknown" });
  }
}
