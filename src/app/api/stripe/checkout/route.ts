import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { buildLineItems } from "@/lib/stripe-prices";
import { NextResponse } from "next/server";
import type { MemberType } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ncc-chiro.or.jp";

export async function POST() {
  const stripe = getStripe();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const service = await createServiceClient();

  const { data: member, error: memErr } = await service
    .from("members")
    .select("id, name, email, member_type, stripe_customer_id, payment_status")
    .eq("auth_id", user.id)
    .single();

  if (memErr || !member) {
    return NextResponse.json(
      { error: "会員情報が見つかりません。" },
      { status: 404 }
    );
  }

  if (member.payment_status === "paid") {
    return NextResponse.json(
      { error: "すでに決済済みです。" },
      { status: 400 }
    );
  }

  let customerId = member.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: member.email,
      name: member.name,
      metadata: { member_id: member.id },
    });
    customerId = customer.id;

    await service
      .from("members")
      .update({ stripe_customer_id: customerId })
      .eq("id", member.id);
  }

  const lineItems = buildLineItems(member.member_type as MemberType);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: lineItems,
    success_url: `${SITE_URL}/member/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/member/payment?cancelled=1`,
    metadata: { member_id: member.id },
    subscription_data: {
      metadata: { member_id: member.id },
    },
    locale: "ja",
    payment_method_types: ["card"],
  });

  return NextResponse.json({ url: session.url });
}
