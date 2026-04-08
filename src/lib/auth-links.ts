import type { SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const SITE_URL = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || "https://www.ncc-chiro.or.jp").replace(
    /\/+$/,
    ""
  );

const TOKEN_EXPIRY_HOURS = 72;

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * 独自のパスワード設定トークンを生成し、members テーブルに保存。
 * Supabaseの認証フローに依存しないワンタイムURL方式。
 */
export async function generatePasswordSetupUrl(
  serviceClient: SupabaseClient,
  email: string
): Promise<string | null> {
  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
  ).toISOString();

  const { error } = await serviceClient
    .from("members")
    .update({ setup_token: token, setup_token_expires: expiresAt })
    .eq("email", email);

  if (error) {
    console.error("Failed to save setup token:", error.message);
    return null;
  }

  return `${SITE_URL()}/auth/setup-account?token=${encodeURIComponent(token)}`;
}
