import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendMemberApprovalNotification } from "@/lib/email";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

function generatePassword() {
  const base = randomBytes(9).toString("base64url").slice(0, 12);
  return `${base}Aa1`;
}

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

  if (!adminMember || adminMember.role !== "system_admin") {
    return NextResponse.json(
      { error: "最終承認はシステム管理者のみ実行できます。" },
      { status: 403 }
    );
  }

  let body: { applicationId?: string; password?: string };
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

  const service = await createServiceClient();

  const { data: app, error: appErr } = await service
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (appErr || !app) {
    return NextResponse.json(
      { error: "申込みが見つかりません。" },
      { status: 404 }
    );
  }

  if (app.status === "approved") {
    return NextResponse.json(
      { error: "すでに承認済みです。" },
      { status: 400 }
    );
  }

  if (app.status !== "staff_approved") {
    return NextResponse.json(
      { error: "事務局の承認が完了していません。先に事務局承認を行ってください。" },
      { status: 400 }
    );
  }

  const password =
    typeof body.password === "string" && body.password.length >= 8
      ? body.password
      : generatePassword();

  const { data: authData, error: authError } =
    await service.auth.admin.createUser({
      email: app.email,
      password,
      email_confirm: true,
      user_metadata: { name: app.name },
    });

  if (authError || !authData.user) {
    return NextResponse.json(
      {
        error:
          authError?.message ??
          "認証ユーザーの作成に失敗しました（メール重複の可能性があります）。",
      },
      { status: 400 }
    );
  }

  const { count } = await service
    .from("members")
    .select("id", { count: "exact", head: true });

  const nextNum = (count ?? 0) + 1;
  const member_number = `M${String(nextNum).padStart(5, "0")}`;

  const { data: newMember, error: memErr } = await service
    .from("members")
    .insert({
      auth_id: authData.user.id,
      member_number,
      name: app.name,
      name_kana: app.name_kana,
      email: app.email,
      phone: app.phone,
      postal_code: app.postal_code,
      address: app.address,
      clinic_name: app.clinic_name,
      member_type: app.desired_member_type,
      role: "member",
      status: "active",
      qualifications: app.qualifications,
      practice_years: app.practice_years,
      is_public: false,
    })
    .select("id")
    .single();

  if (memErr || !newMember) {
    await service.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json(
      {
        error:
          memErr?.message ?? "会員レコードの作成に失敗しました。",
      },
      { status: 400 }
    );
  }

  const { error: updErr } = await service
    .from("applications")
    .update({ status: "approved" })
    .eq("id", applicationId);

  if (updErr) {
    return NextResponse.json(
      { error: "申込みステータスの更新に失敗しました。" },
      { status: 500 }
    );
  }

  const returnPassword =
    typeof body.password === "string" && body.password.length >= 8
      ? undefined
      : password;

  await sendMemberApprovalNotification(
    app.name,
    app.email,
    returnPassword ?? null
  );

  return NextResponse.json({
    ok: true,
    memberId: newMember.id,
    ...(returnPassword ? { tempPassword: returnPassword } : {}),
  });
}
