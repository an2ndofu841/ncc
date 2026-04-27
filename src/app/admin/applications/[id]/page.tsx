import ApplicationDetailClient from "@/app/admin/applications/[id]/ApplicationDetailClient";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/types";
import { formatDate, MEMBER_TYPE_LABELS } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServiceClient();
  const { data: appRow, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !appRow) {
    notFound();
  }

  const application = appRow as Application;

  let attachmentSignedUrl: string | null = null;
  if (application.attachment_url) {
    if (application.attachment_url.startsWith("applications:")) {
      const storagePath = application.attachment_url.replace("applications:", "");
      const { data: signed } = await supabase.storage
        .from("applications")
        .createSignedUrl(storagePath, 60 * 60);
      attachmentSignedUrl = signed?.signedUrl ?? null;
    } else {
      attachmentSignedUrl = application.attachment_url;
    }
  }

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  let userRole = "";
  if (user) {
    const { data: m } = await supabase
      .from("members")
      .select("role")
      .eq("auth_id", user.id)
      .single();
    userRole = m?.role ?? "";
  }

  return (
    <>
      <PageHeader
        title="申込み詳細"
        description={application.name}
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "申込み", href: "/admin/applications" },
          { label: application.name },
        ]}
      />
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-neutral-500">お名前</dt>
              <dd className="font-medium text-neutral-900">{application.name}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">ふりがな</dt>
              <dd>{application.name_kana}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">生年月日</dt>
              <dd>{application.birth_date}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">性別</dt>
              <dd>{application.gender}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">メール</dt>
              <dd className="break-all">{application.email}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">電話番号</dt>
              <dd>{application.phone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-neutral-500">住所</dt>
              <dd>
                〒{application.postal_code} {application.address}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-neutral-500">施術所・勤務先</dt>
              <dd>{application.clinic_name ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-neutral-500">資格・経歴</dt>
              <dd className="whitespace-pre-wrap">
                {application.qualifications ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">実務年数</dt>
              <dd>
                {application.practice_years != null
                  ? `${application.practice_years} 年`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">希望会員種別</dt>
              <dd>
                {MEMBER_TYPE_LABELS[application.desired_member_type] ??
                  application.desired_member_type}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">紹介者</dt>
              <dd>{application.referrer_name ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-neutral-500">備考・志望動機</dt>
              <dd className="whitespace-pre-wrap">
                {application.remarks ?? "—"}
              </dd>
            </div>
            {attachmentSignedUrl && (
              <div className="sm:col-span-2">
                <dt className="text-neutral-500">添付</dt>
                <dd>
                  <a
                    href={attachmentSignedUrl}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ファイルを開く
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-neutral-500">申込日</dt>
              <dd>{formatDate(application.created_at)}</dd>
            </div>
          </dl>
        </Card>

        <ApplicationDetailClient
          application={application}
          userRole={userRole}
        />
      </div>
    </>
  );
}
