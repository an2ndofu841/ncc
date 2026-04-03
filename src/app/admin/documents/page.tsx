import DocumentsPanel from "@/app/admin/documents/DocumentsPanel";
import PageHeader from "@/components/ui/PageHeader";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Document } from "@/lib/types";
import { revalidatePath } from "next/cache";

async function uploadDocumentAction(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("ログインが必要です。");
  }

  const { data: m } = await supabase
    .from("members")
    .select("role")
    .eq("auth_id", user.id)
    .single();

  if (
    !m ||
    (m.role !== "system_admin" && m.role !== "office_staff")
  ) {
    throw new Error("アップロードの権限がありません。");
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    throw new Error("ファイルを選択してください。");
  }

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "general").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const is_published = formData.get("is_published") === "on";

  const service = await createServiceClient();
  const safeName = file.name.replace(/[^\w.\-() \u3000-\u30ff\u4e00-\u9faf]+/g, "_");
  const path = `${user.id}/${Date.now()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await service.storage
    .from("documents")
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
    });

  if (upErr) {
    throw new Error(upErr.message);
  }

  const { error: dbErr } = await service.from("documents").insert({
    title: title || file.name,
    description,
    category,
    file_url: path,
    file_name: file.name,
    is_published,
    published_at: is_published ? new Date().toISOString() : null,
  });

  if (dbErr) {
    await service.storage.from("documents").remove([path]);
    throw new Error(dbErr.message);
  }

  revalidatePath("/admin/documents");
}

export default async function AdminDocumentsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        書類一覧の取得に失敗しました。権限をご確認ください。
      </div>
    );
  }

  const documents = (data ?? []) as Document[];

  return (
    <>
      <PageHeader
        title="書類管理"
        description="会員向け資料のアップロードと管理を行います。"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "書類" },
        ]}
      />
      <div className="mx-auto max-w-6xl">
        <DocumentsPanel
          documents={documents}
          uploadAction={uploadDocumentAction}
        />
      </div>
    </>
  );
}
