import ContactsTableClient from "@/app/admin/contacts/ContactsTableClient";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";
import type { Contact } from "@/lib/types";

export default async function AdminContactsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Card>
        <p className="text-red-600">
          お問い合わせ一覧の取得に失敗しました。権限をご確認ください。
        </p>
      </Card>
    );
  }

  const contacts = (data ?? []) as Contact[];

  return (
    <>
      <PageHeader
        title="お問い合わせ管理"
        description="サイトから届いたお問い合わせの確認・対応状況の管理を行います。"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "お問い合わせ" },
        ]}
      />
      <div className="mx-auto max-w-6xl">
        <ContactsTableClient contacts={contacts} />
      </div>
    </>
  );
}
