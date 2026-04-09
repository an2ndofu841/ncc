import { createServiceClient } from "@/lib/supabase/server";
import { sendRenewalReminderEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

const REMINDER_SCHEDULE = [
  { daysBeforeRenewal: 30, type: "auto_30d" },
  { daysBeforeRenewal: 7, type: "auto_7d" },
  { daysBeforeRenewal: 1, type: "auto_1d" },
  { daysBeforeRenewal: -7, type: "auto_overdue" },
] as const;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = await createServiceClient();
  const today = new Date();
  let totalSent = 0;

  for (const schedule of REMINDER_SCHEDULE) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + schedule.daysBeforeRenewal);
    const targetDateStr = targetDate.toISOString().slice(0, 10);

    const { data: members } = await service
      .from("members")
      .select("id, name, email, renewal_date, stripe_subscription_id, role")
      .eq("renewal_date", targetDateStr)
      .eq("payment_status", "paid")
      .is("stripe_subscription_id", null);

    if (!members || members.length === 0) continue;

    for (const member of members) {
      if (["system_admin", "office_staff", "editor"].includes(member.role)) {
        continue;
      }

      const { data: existing } = await service
        .from("renewal_reminders")
        .select("id")
        .eq("member_id", member.id)
        .eq("reminder_type", schedule.type)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const daysLeft = Math.ceil(
        (new Date(member.renewal_date).getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const renewalDateStr = new Date(member.renewal_date).toLocaleDateString(
        "ja-JP",
        { year: "numeric", month: "long", day: "numeric" }
      );

      try {
        await sendRenewalReminderEmail(
          member.name,
          member.email,
          renewalDateStr,
          daysLeft
        );

        await service.from("renewal_reminders").insert({
          member_id: member.id,
          reminder_type: schedule.type,
          email_to: member.email,
        });

        totalSent++;
      } catch (err) {
        console.error(
          `Failed to send renewal reminder to ${member.email}:`,
          err
        );
      }
    }
  }

  return NextResponse.json({
    ok: true,
    sent: totalSent,
    timestamp: new Date().toISOString(),
  });
}
