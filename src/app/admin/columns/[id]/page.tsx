import ColumnEditForm from "@/app/admin/columns/[id]/ColumnEditForm";
import PageHeader from "@/components/ui/PageHeader";
import { createServiceClient } from "@/lib/supabase/server";
import type { Column } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function AdminColumnEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("columns")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const column = data as Column;

  return (
    <>
      <PageHeader
        title="コラムの編集"
        description={column.title}
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "コラム", href: "/admin/columns" },
          { label: "編集" },
        ]}
      />
      <div className="mx-auto max-w-3xl">
        <ColumnEditForm column={column} />
      </div>
    </>
  );
}
