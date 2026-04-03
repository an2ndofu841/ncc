import ApplicationsTableClient from "@/app/admin/applications/ApplicationsTableClient";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { createServiceClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/types";

export default async function AdminApplicationsPage() {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Card>
        <p className="text-red-600">
          申込み一覧の取得に失敗しました。権限をご確認ください。
        </p>
      </Card>
    );
  }

  const applications = (data ?? []) as Application[];

  return (
    <>
      <PageHeader
        title="申込み管理"
        description="入会申込みの確認・審査を行います。"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "申込み" },
        ]}
      />
      <div className="mx-auto max-w-6xl">
        <ApplicationsTableClient applications={applications} />
      </div>
    </>
  );
}
