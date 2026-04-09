import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendRenewalReminderEmail } from "@/lib/email";
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
    .select("id, name, email, renewal_date")
    .eq("id", memberId)
    .single();

  if (!member) {
    return NextResponse.json(
      { error: "会員情報が見つかりません。" },
      { status: 404 }
    );
  }

  if (!member.renewal_date) {
    return NextResponse.json(
      { error: "更新日が設定されていません。" },
      { status: 400 }
    );
  }

  const rd = new Date(member.renewal_date);
  const daysLeft = Math.ceil(
    (rd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const renewalDateStr = rd.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  try {
    await sendRenewalReminderEmail(
      member.name,
      member.email,
      renewalDateStr,
      daysLeft
    );

    await service.from("renewal_reminders").insert({
      member_id: member.id,
      reminder_type: "manual",
      email_to: member.email,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Manual renewal reminder error:", err);
    return NextResponse.json(
      { error: "メール送信に失敗しました。" },
      { status: 500 }
    );
  }
}
