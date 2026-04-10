import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

function renewalDateOneYearFromNow(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

type ServiceClient = Awaited<ReturnType<typeof createServiceClient>>;

async function safeUpdateMember(
  service: ServiceClient,
  filter: { field: string; value: string },
  payload: Record<string, unknown>
) {
  const { error } = await service
    .from("members")
    .update(payload)
    .eq(filter.field, filter.value);

  if (error) {
    console.warn(`Member update failed (${filter.field}=${filter.value}):`, error.message);
    const { renewal_date, last_checkout_session_id, ...essential } = payload as Record<string, unknown> & {
      renewal_date?: unknown;
      last_checkout_session_id?: unknown;
    };
    void renewal_date;
    void last_checkout_session_id;
    if (Object.keys(essential).length > 0) {
      const { error: retryErr } = await service
        .from("members")
        .update(essential)
        .eq(filter.field, filter.value);
      if (retryErr) {
        console.error("Fallback update also failed:", retryErr.message);
      }
    }
  }
}

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

      if (session.payment_status === "paid") {
        await safeUpdateMember(
          service,
          { field: "id", value: memberId },
          {
            payment_status: "paid",
            stripe_subscription_id: subscriptionId ?? null,
            renewal_date: renewalDateOneYearFromNow(),
          }
        );
      }

      break;
    }

    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const memberId = session.metadata?.member_id;
      if (!memberId) break;

      await safeUpdateMember(
        service,
        { field: "id", value: memberId },
        {
          payment_status: "paid",
          renewal_date: renewalDateOneYearFromNow(),
        }
      );

      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const memberId = session.metadata?.member_id;
      if (!memberId) break;

      await service
        .from("members")
        .update({ payment_status: "overdue" })
        .eq("id", memberId);

      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      const subId = "subscription" in invoice
        ? (invoice.subscription as string | null)
        : null;

      if (subId) {
        await safeUpdateMember(
          service,
          { field: "stripe_subscription_id", value: subId },
          {
            payment_status: "paid",
            renewal_date: renewalDateOneYearFromNow(),
          }
        );
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
