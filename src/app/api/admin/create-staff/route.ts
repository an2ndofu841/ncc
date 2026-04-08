import { createClient, createServiceClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

const roleEnum = z.enum(["office_staff", "editor"]);

const schema = z.object({
  name: z.string().min(1, "氏名を入力してください。"),
  name_kana: z.string().min(1, "ふりがなを入力してください。"),
  email: z.string().email("有効なメールアドレスを入力してください。"),
  role: roleEnum,
  password: z.string().min(8, "パスワードは8文字以上にしてください。").optional(),
});

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

  const service = await createServiceClient();

  const { data: adminMember } = await service
    .from("members")
    .select("role")
    .eq("auth_id", user.id)
    .single();

  if (!adminMember || adminMember.role !== "system_admin") {
    return NextResponse.json(
      { error: "システム管理者のみ実行できます。" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです。" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容をご確認ください。" },
      { status: 400 }
    );
  }

  const { name, name_kana, email, role } = parsed.data;
  const password = parsed.data.password || generatePassword();

  const { data: authData, error: authError } =
    await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
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
  const member_number = `S${String(nextNum).padStart(5, "0")}`;

  const { error: memErr } = await service.from("members").insert({
    auth_id: authData.user.id,
    member_number,
    name,
    name_kana,
    email,
    phone: "",
    postal_code: "",
    address: "",
    member_type: "regular",
    role,
    status: "active",
    is_public: false,
  });

  if (memErr) {
    await service.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json(
      { error: memErr.message ?? "会員レコードの作成に失敗しました。" },
      { status: 400 }
    );
  }

  const isAutoPassword = !parsed.data.password;

  return NextResponse.json({
    ok: true,
    member_number,
    ...(isAutoPassword ? { tempPassword: password } : {}),
  });
}
