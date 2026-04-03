import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { createServiceClient } from "@/lib/supabase/server";
import type { StaticPage } from "@/lib/types";
import Link from "next/link";

export default async function AdminStaticPagesPage() {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("static_pages")
    .select("*")
    .order("slug", { ascending: true });

  if (error) {
    return (
      <Card>
        <p className="text-red-600">
          固定ページの取得に失敗しました。権限をご確認ください。
        </p>
      </Card>
    );
  }

  const pages = (data ?? []) as StaticPage[];

  return (
    <>
      <PageHeader
        title="固定ページ管理"
        description="サイト内の固定ページ（規約・概要など）の編集ができます。"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "固定ページ" },
        ]}
      />
      <div className="mx-auto max-w-6xl">
        <Card padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr className="text-neutral-600">
                  <th className="px-4 py-3 font-medium">スラッグ</th>
                  <th className="px-4 py-3 font-medium">タイトル</th>
                  <th className="px-4 py-3 font-medium">公開</th>
                  <th className="px-4 py-3 font-medium">更新日</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {pages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-neutral-500"
                    >
                      固定ページがまだありません。
                    </td>
                  </tr>
                ) : (
                  pages.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-neutral-600">
                        {p.slug}
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {p.title}
                      </td>
                      <td className="px-4 py-3">
                        {p.is_published ? (
                          <Badge variant="success">公開</Badge>
                        ) : (
                          <Badge variant="default">非公開</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                        {new Date(p.updated_at).toLocaleDateString("ja-JP")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/pages/${p.id}`}>
                          <Button variant="outline" size="sm">
                            編集
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
