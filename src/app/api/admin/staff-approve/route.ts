import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const service = await createServiceClient();

  const { data: adminMember } = await service
    .from("members")
    .select("role, name")
    .eq("auth_id", user.id)
    .single();

  if (
    !adminMember ||
    (adminMember.role !== "system_admin" && adminMember.role !== "office_staff")
  ) {
    return NextResponse.json(
      { error: "事務局またはシステム管理者のみ実行できます。" },
      { status: 403 }
    );
  }

  let body: { applicationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです。" }, { status: 400 });
  }

  const applicationId = body.applicationId;
  if (!applicationId || typeof applicationId !== "string") {
    return NextResponse.json(
      { error: "applicationId が必要です。" },
      { status: 400 }
    );
  }

  const { data: app, error: appErr } = await service
    .from("applications")
    .select("id, status")
    .eq("id", applicationId)
    .single();

  if (appErr || !app) {
    return NextResponse.json(
      { error: "申込みが見つかりません。" },
      { status: 404 }
    );
  }

  if (app.status === "approved" || app.status === "staff_approved") {
    return NextResponse.json(
      { error: "すでに承認済みです。" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const note = `[${now}] 事務局承認: ${adminMember.name}`;

  const { error: updErr } = await service
    .from("applications")
    .update({
      status: "staff_approved",
      admin_notes: app.status === "unreviewed"
        ? note
        : `${note}`,
    })
    .eq("id", applicationId);

  if (updErr) {
    return NextResponse.json(
      { error: "ステータスの更新に失敗しました。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
