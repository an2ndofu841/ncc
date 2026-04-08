import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const service = await createServiceClient();
  const { data: member } = await service
    .from("members")
    .select("id, stripe_subscription_id, payment_status")
    .eq("auth_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json(
      { error: "会員情報が見つかりません。" },
      { status: 404 }
    );
  }

  if (!member.stripe_subscription_id) {
    return NextResponse.json(
      { error: "有効なサブスクリプションがありません。" },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.update(
      member.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    await service
      .from("members")
      .update({ payment_status: "cancelled" })
      .eq("id", member.id);

    const cancelAt =
      "cancel_at" in subscription
        ? (subscription.cancel_at as number | null)
        : null;

    return NextResponse.json({
      ok: true,
      cancel_at: cancelAt
        ? new Date(cancelAt * 1000).toISOString()
        : null,
    });
  } catch (err) {
    console.error("Subscription cancel error:", err);
    return NextResponse.json(
      { error: "解約処理に失敗しました。事務局までお問い合わせください。" },
      { status: 500 }
    );
  }
}
