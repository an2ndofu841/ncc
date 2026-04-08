import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const NUM_LENGTH = 6;
const MAX_RETRIES = 10;

function randomCode(): string {
  const bytes = randomBytes(NUM_LENGTH);
  let result = "";
  for (let i = 0; i < NUM_LENGTH; i++) {
    result += CHARS[bytes[i] % CHARS.length];
  }
  return result;
}

/**
 * ランダムな会員番号を生成する。
 * prefix "M" → 一般会員（例: M-K3X9PQ）
 * prefix "S" → 運営スタッフ（例: S-A7BN4R）
 * 重複時はリトライする。
 */
export async function generateMemberNumber(
  supabase: SupabaseClient,
  prefix: "M" | "S"
): Promise<string> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const candidate = `${prefix}-${randomCode()}`;
    const { count } = await supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("member_number", candidate);

    if ((count ?? 0) === 0) {
      return candidate;
    }
  }
  throw new Error("会員番号の生成に失敗しました。再度お試しください。");
}
