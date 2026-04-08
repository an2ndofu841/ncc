import { createServiceClient } from "@/lib/supabase/server";
import { sendApplicationConfirmation, sendApplicationNotificationToAdmin } from "@/lib/email";
import type { MemberType } from "@/lib/types";
import { NextResponse } from "next/server";
import { z } from "zod";

const memberTypes = [
  "regular",
  "associate",
  "family",
  "student",
] as const satisfies readonly MemberType[];

const applicationPayloadSchema = z.object({
  name: z.string().min(1),
  name_kana: z.string().min(1),
  birth_date: z.string().min(1),
  gender: z.string().min(1),
  postal_code: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  clinic_name: z.string().nullable().optional(),
  qualifications: z.string().min(1),
  practice_years: z.number().int().min(0).max(80).nullable(),
  desired_member_type: z.enum(memberTypes),
  referrer_name: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  agreed_to_terms: z.literal(true),
});

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const raw = formData.get("payload");
    if (typeof raw !== "string") {
      return NextResponse.json(
        { ok: false, error: "無効なリクエストです。" },
        { status: 400 }
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { ok: false, error: "データの形式が正しくありません。" },
        { status: 400 }
      );
    }

    const parsed = applicationPayloadSchema.safeParse(parsedJson);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        {
          ok: false,
          error: first?.message ?? "入力内容をご確認ください。",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const file = formData.get("attachment");

    let attachmentUrl: string | null = null;
    const supabase = await createServiceClient();

    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { ok: false, error: "添付ファイルは10MB以下にしてください。" },
          { status: 400 }
        );
      }
      if (!ALLOWED_MIME.has(file.type)) {
        return NextResponse.json(
          {
            ok: false,
            error: "添付はPDF、JPEG、PNG、WebPのみ対応しています。",
          },
          { status: 400 }
        );
      }
      const ext =
        file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
      const path = `applications/${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(path, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (uploadError) {
        console.error(uploadError);
        return NextResponse.json(
          { ok: false, error: "ファイルのアップロードに失敗しました。" },
          { status: 500 }
        );
      }
      const { data: pub } = supabase.storage.from("uploads").getPublicUrl(path);
      attachmentUrl = pub.publicUrl;
    }

    const { error: insertError } = await supabase.from("applications").insert({
      name: data.name,
      name_kana: data.name_kana,
      birth_date: data.birth_date,
      gender: data.gender,
      postal_code: data.postal_code,
      address: data.address,
      phone: data.phone,
      email: data.email,
      clinic_name: data.clinic_name ?? null,
      qualifications: data.qualifications,
      practice_years: data.practice_years,
      desired_member_type: data.desired_member_type,
      referrer_name: data.referrer_name ?? null,
      remarks: data.remarks ?? null,
      attachment_url: attachmentUrl,
      status: "unreviewed",
    });

    if (insertError) {
      console.error("Application insert error:", insertError.message, insertError.details, insertError.hint);
      return NextResponse.json(
        { ok: false, error: "申込みの保存に失敗しました。しばらくしてから再度お試しください。" },
        { status: 500 }
      );
    }

    await Promise.all([
      sendApplicationConfirmation(data.name, data.email),
      sendApplicationNotificationToAdmin(data.name, data.email),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
