import { createServiceClient } from "@/lib/supabase/server";
import { sendContactConfirmation, sendContactNotificationToAdmin } from "@/lib/email";
import { CONTACT_CATEGORY_LABELS } from "@/lib/utils";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const categories = [
  "general",
  "membership",
  "seminar",
  "complaint",
  "other",
] as const;

const contactSchema = z.object({
  name: z.string().min(1, "お名前を入力してください。"),
  email: z.string().email("有効なメールアドレスを入力してください。"),
  phone: z.union([z.string(), z.null()]).optional(),
  category: z.enum(categories),
  message: z.string().min(1, "お問い合わせ内容を入力してください。"),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!success) return rateLimitResponse();

  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        {
          ok: false,
          error: first?.message ?? "入力内容をご確認ください。",
        },
        { status: 400 }
      );
    }

    const { name, email, phone, category, message } = parsed.data;
    const supabase = await createServiceClient();

    const { error } = await supabase.from("contacts").insert({
      name,
      email,
      phone: phone?.trim() ? phone.trim() : null,
      category,
      message,
      is_read: false,
    });

    if (error) {
      console.error(error);
      return NextResponse.json(
        {
          ok: false,
          error:
            "送信に失敗しました。時間をおいて再度お試しください。",
        },
        { status: 500 }
      );
    }

    await Promise.all([
      sendContactConfirmation(name, email),
      sendContactNotificationToAdmin(
        name,
        email,
        CONTACT_CATEGORY_LABELS[category] ?? category
      ),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "無効なリクエストです。" },
      { status: 400 }
    );
  }
}
