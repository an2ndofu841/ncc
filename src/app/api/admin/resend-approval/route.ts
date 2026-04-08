import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generatePasswordSetupUrl } from "@/lib/auth-links";
import { sendMemberApprovalNotification } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const { data: adminMember } = await supabase
    .from("members")
    .select("role")
    .eq("auth_id", user.id)
    .single();

  if (
    !adminMember ||
    !["system_admin", "office_staff"].includes(adminMember.role)
  ) {
    return NextResponse.json(
      { error: "管理者権限が必要です。" },
      { status: 403 }
    );
  }

  let body: { applicationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "不正なリクエストです。" },
      { status: 400 }
    );
  }

  const { applicationId } = body;
  if (!applicationId || typeof applicationId !== "string") {
    return NextResponse.json(
      { error: "applicationId が必要です。" },
      { status: 400 }
    );
  }

  const service = await createServiceClient();

  const { data: app, error: appErr } = await service
    .from("applications")
    .select("name, email, status")
    .eq("id", applicationId)
    .single();

  if (appErr || !app) {
    return NextResponse.json(
      { error: "申込みが見つかりません。" },
      { status: 404 }
    );
  }

  if (app.status !== "approved") {
    return NextResponse.json(
      { error: "承認済みの申込みに対してのみ再送できます。" },
      { status: 400 }
    );
  }

  const setupUrl = await generatePasswordSetupUrl(service, app.email);

  await sendMemberApprovalNotification(app.name, app.email, setupUrl);

  return NextResponse.json({ ok: true });
}
