import ContactDetailClient from "@/app/admin/contacts/[id]/ContactDetailClient";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { createServiceClient } from "@/lib/supabase/server";
import type { Contact } from "@/lib/types";
import { CONTACT_CATEGORY_LABELS, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function AdminContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const contact = data as Contact;

  return (
    <>
      <PageHeader
        title="お問い合わせ詳細"
        description={contact.name}
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "お問い合わせ", href: "/admin/contacts" },
          { label: "詳細" },
        ]}
      />
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {contact.is_read ? (
              <Badge variant="default">既読</Badge>
            ) : (
              <Badge variant="info">未読</Badge>
            )}
            <span className="text-sm text-neutral-500">
              {formatDate(contact.created_at)} 受信
            </span>
          </div>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-neutral-500">お名前</dt>
              <dd className="font-medium text-neutral-900">{contact.name}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">メールアドレス</dt>
              <dd className="break-all">{contact.email}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">電話番号</dt>
              <dd>{contact.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">区分</dt>
              <dd>
                {CONTACT_CATEGORY_LABELS[contact.category] ?? contact.category}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="mb-2 text-neutral-500">お問い合わせ内容</dt>
              <dd className="whitespace-pre-wrap rounded-lg bg-neutral-50 p-4 text-neutral-900">
                {contact.message}
              </dd>
            </div>
          </dl>
        </Card>

        <ContactDetailClient contact={contact} />
      </div>
    </>
  );
}
