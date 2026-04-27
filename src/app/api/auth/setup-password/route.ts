import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = rateLimit(`setup-password:${ip}`, { limit: 5, windowMs: 300_000 });
  if (!success) return rateLimitResponse();

  let body: { token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "不正なリクエストです。" },
      { status: 400 }
    );
  }

  const { token, password } = body;
  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { error: "トークンが必要です。" },
      { status: 400 }
    );
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "パスワードは8文字以上で入力してください。" },
      { status: 400 }
    );
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: "パスワードには英字と数字の両方を含めてください。" },
      { status: 400 }
    );
  }

  const service = await createServiceClient();

  const { data: member, error: findErr } = await service
    .from("members")
    .select("id, auth_id, email, setup_token_expires")
    .eq("setup_token", token)
    .single();

  if (findErr || !member) {
    return NextResponse.json(
      { error: "無効なリンクです。再度管理者にメールの再送を依頼してください。" },
      { status: 400 }
    );
  }

  if (
    member.setup_token_expires &&
    new Date(member.setup_token_expires) < new Date()
  ) {
    return NextResponse.json(
      { error: "リンクの有効期限が切れています。管理者にメールの再送を依頼してください。" },
      { status: 400 }
    );
  }

  if (!member.auth_id) {
    return NextResponse.json(
      { error: "認証アカウントが見つかりません。" },
      { status: 400 }
    );
  }

  const { error: updateErr } = await service.auth.admin.updateUserById(
    member.auth_id,
    { password }
  );

  if (updateErr) {
    console.error("Password setup failed:", updateErr.message);
    return NextResponse.json(
      { error: "パスワードの設定に失敗しました。しばらくしてから再度お試しください。" },
      { status: 500 }
    );
  }

  await service
    .from("members")
    .update({ setup_token: null, setup_token_expires: null })
    .eq("id", member.id);

  return NextResponse.json({ ok: true, email: member.email });
}
