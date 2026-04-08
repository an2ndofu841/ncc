import type { SupabaseClient } from "@supabase/supabase-js";

const SITE_URL = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || "https://www.ncc-chiro.or.jp").replace(
    /\/+$/,
    ""
  );

/**
 * Supabase Admin API でパスワードリカバリーリンクを生成し、
 * ユーザーがパスワードを設定できるURLを返す。
 */
export async function generatePasswordSetupUrl(
  serviceClient: SupabaseClient,
  email: string
): Promise<string | null> {
  try {
    const { data, error } = await serviceClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${SITE_URL()}/auth/callback?next=/auth/update-password`,
      },
    });

    if (error || !data?.properties?.action_link) {
      console.error("generateLink error:", error?.message);
      return null;
    }

    return data.properties.action_link;
  } catch (err) {
    console.error("generatePasswordSetupUrl error:", err);
    return null;
  }
}
