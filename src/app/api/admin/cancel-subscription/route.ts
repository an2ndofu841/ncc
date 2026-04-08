import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const service = await createServiceClient();
  const { data: admin } = await service
    .from("members")
    .select("role")
    .eq("auth_id", user.id)
    .single();

  if (!admin || !["system_admin", "office_staff"].includes(admin.role)) {
    return NextResponse.json({ error: "権限がありません。" }, { status: 403 });
  }

  const { memberId } = await req.json();
  if (!memberId) {
    return NextResponse.json(
      { error: "会員IDが必要です。" },
      { status: 400 }
    );
  }

  const { data: member } = await service
    .from("members")
    .select("id, stripe_subscription_id")
    .eq("id", memberId)
    .single();

  if (!member?.stripe_subscription_id) {
    return NextResponse.json(
      { error: "有効なサブスクリプションがありません。" },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    await stripe.subscriptions.update(member.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await service
      .from("members")
      .update({ payment_status: "cancelled" })
      .eq("id", member.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin subscription cancel error:", err);
    return NextResponse.json(
      { error: "解約処理に失敗しました。" },
      { status: 500 }
    );
  }
}
