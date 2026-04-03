import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/member";

  if (!code) {
    const login = new URL("/auth/login", origin);
    login.searchParams.set("error", "missing_code");
    return NextResponse.redirect(login);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const login = new URL("/auth/login", origin);
    login.searchParams.set("error", "auth_callback");
    login.searchParams.set(
      "message",
      "認証に失敗しました。もう一度お試しください。"
    );
    return NextResponse.redirect(login);
  }

  const destination = next.startsWith("/") ? next : "/member";
  return NextResponse.redirect(`${origin}${destination}`);
}
