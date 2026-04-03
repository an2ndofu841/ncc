import StaticPageEditForm from "@/app/admin/pages/[id]/StaticPageEditForm";
import PageHeader from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";
import type { StaticPage } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function AdminStaticPageEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("static_pages")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const page = data as StaticPage;

  return (
    <>
      <PageHeader
        title="固定ページの編集"
        description={`/${page.slug}`}
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "固定ページ", href: "/admin/pages" },
          { label: "編集" },
        ]}
      />
      <div className="mx-auto max-w-4xl">
        <StaticPageEditForm page={page} />
      </div>
    </>
  );
}
