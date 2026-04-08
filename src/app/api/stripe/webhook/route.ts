import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const service = await createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const memberId = session.metadata?.member_id;
      if (!memberId) break;

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      await service
        .from("members")
        .update({
          payment_status: "paid",
          stripe_subscription_id: subscriptionId ?? null,
        })
        .eq("id", memberId);

      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      const subId = "subscription" in invoice
        ? (invoice.subscription as string | null)
        : null;

      if (subId) {
        await service
          .from("members")
          .update({ payment_status: "paid" })
          .eq("stripe_subscription_id", subId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const subId = "subscription" in invoice
        ? (invoice.subscription as string | null)
        : null;

      if (subId) {
        await service
          .from("members")
          .update({ payment_status: "overdue" })
          .eq("stripe_subscription_id", subId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await service
        .from("members")
        .update({ payment_status: "cancelled" })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
