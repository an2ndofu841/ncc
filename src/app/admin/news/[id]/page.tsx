import NewsEditForm from "@/app/admin/news/[id]/NewsEditForm";
import PageHeader from "@/components/ui/PageHeader";
import { createServiceClient } from "@/lib/supabase/server";
import type { News } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function AdminNewsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const news = data as News;

  return (
    <>
      <PageHeader
        title="お知らせの編集"
        description={news.title}
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "お知らせ", href: "/admin/news" },
          { label: "編集" },
        ]}
      />
      <div className="mx-auto max-w-3xl">
        <NewsEditForm news={news} />
      </div>
    </>
  );
}
