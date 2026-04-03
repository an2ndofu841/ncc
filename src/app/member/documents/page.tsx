import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import type { Document } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Download, FileText } from "lucide-react";

export default async function MemberDocumentsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("documents")
    .select("*")
    .eq("is_published", true)
    .order("category", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false });

  const docs = (rows ?? []) as Document[];

  const byCategory = docs.reduce<Record<string, Document[]>>((acc, d) => {
    const key = d.category || "その他";
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  const categories = Object.keys(byCategory).sort((a, b) =>
    a.localeCompare(b, "ja")
  );

  return (
    <>
      <PageHeader
        title="書類ダウンロード"
        description="会員向けに公開している資料・様式をカテゴリ別にダウンロードできます。"
        breadcrumbs={[
          { label: "会員ページ", href: "/member" },
          { label: "書類ダウンロード" },
        ]}
      />
      <div className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {categories.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-neutral-500">
              現在、ダウンロード可能な書類はありません。
            </p>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category} className="border-primary-100">
              <h2 className="flex items-center gap-2 text-lg font-bold text-primary-700">
                <FileText className="h-5 w-5" />
                {category}
              </h2>
              <ul className="mt-4 space-y-3">
                {byCategory[category].map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-col gap-2 rounded-lg border border-neutral-100 bg-neutral-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900">
                        {doc.title}
                      </p>
                      {doc.description && (
                        <p className="mt-1 text-sm text-neutral-600">
                          {doc.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-neutral-500">
                        {doc.published_at && (
                          <span>公開: {formatDate(doc.published_at)}</span>
                        )}
                        <span>{doc.file_name}</span>
                      </div>
                    </div>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <Download className="h-4 w-4" />
                      ダウンロード
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
