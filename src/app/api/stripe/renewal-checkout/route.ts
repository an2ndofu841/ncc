import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { FEE_TABLE } from "@/lib/stripe-prices";
import { NextRequest, NextResponse } from "next/server";

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
      ["card", "konbini", "bank_transfer", "paypay"].includes(
        body.paymentMethod
      )
    ) {
      paymentMethod = body.paymentMethod;
    }
  } catch {
    /* default to card */
  }

  const service = await createServiceClient();

  const { data: member } = await service
    .from("members")
    .select("id, name, email, member_type, stripe_customer_id, renewal_date")
    .eq("auth_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json(
      { error: "会員情報が見つかりません。" },
      { status: 404 }
    );
  }

  const fees = FEE_TABLE[member.member_type] ?? FEE_TABLE.regular;

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
  const successUrl = `${siteUrl}/member/payment/renewal-success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${siteUrl}/member/subscription?cancelled=1`;

  const lineItems = [
    {
      price_data: {
        currency: "jpy",
        product_data: { name: "年会費" },
        unit_amount: fees.annual,
      },
      quantity: 1,
    },
  ];

  const pmTypesMap: Record<string, string[]> = {
    card: ["card"],
    konbini: ["konbini"],
    bank_transfer: ["customer_balance"],
    paypay: ["paypay"],
  };

  const sessionParams: Record<string, unknown> = {
    customer: customerId,
    mode: "payment",
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      member_id: member.id,
      payment_method: paymentMethod,
      type: "renewal",
    },
    locale: "ja",
    payment_method_types: pmTypesMap[paymentMethod] ?? ["card"],
  };

  if (paymentMethod === "bank_transfer") {
    sessionParams.payment_method_options = {
      customer_balance: {
        funding_type: "bank_transfer",
        bank_transfer: { type: "jp_bank_transfer" },
      },
    };
  }

  try {
    const session = await stripe.checkout.sessions.create(
      sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]
    );
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Renewal checkout error:", err);
    return NextResponse.json(
      { error: "決済セッションの作成に失敗しました。" },
      { status: 500 }
    );
  }
}
