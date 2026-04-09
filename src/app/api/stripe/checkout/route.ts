import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { buildLineItems, buildOneTimeLineItems } from "@/lib/stripe-prices";
import { NextRequest, NextResponse } from "next/server";
import type { MemberType } from "@/lib/types";

const SITE_URL = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || "https://ncc-chiro.or.jp").replace(
    /\/+$/,
    ""
  );

type PaymentMethodParam = "card" | "konbini" | "bank_transfer" | "paypay";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  let paymentMethod: PaymentMethodParam = "card";
  try {
    const body = await req.json();
    if (
      body.paymentMethod &&
      ["card", "konbini", "bank_transfer", "paypay"].includes(body.paymentMethod)
    ) {
      paymentMethod = body.paymentMethod;
    }
  } catch {
    /* default to card */
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

  const siteUrl = SITE_URL();
  const successUrl = `${siteUrl}/member/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${siteUrl}/member/payment?cancelled=1`;

  if (paymentMethod === "card") {
    const lineItems = buildLineItems(member.member_type as MemberType);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { member_id: member.id, payment_method: "card" },
      subscription_data: {
        metadata: { member_id: member.id },
      },
      locale: "ja",
      payment_method_types: ["card"],
    });

    return NextResponse.json({ url: session.url });
  }

  const oneTimeItems = buildOneTimeLineItems(member.member_type as MemberType);

  const pmTypesMap: Record<string, string[]> = {
    konbini: ["konbini"],
    bank_transfer: ["customer_balance"],
    paypay: ["paypay"],
  };
  const pmTypes = pmTypesMap[paymentMethod] ?? ["konbini"];

  const sessionParams: Record<string, unknown> = {
    customer: customerId,
    mode: "payment",
    line_items: oneTimeItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { member_id: member.id, payment_method: paymentMethod },
    locale: "ja",
    payment_method_types: pmTypes,
  };

  if (paymentMethod === "bank_transfer") {
    sessionParams.payment_intent_data = {
      metadata: { member_id: member.id },
    };
  }

  const session = await stripe.checkout.sessions.create(
    sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]
  );

  return NextResponse.json({ url: session.url });
}
