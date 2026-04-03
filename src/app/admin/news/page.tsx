import NewsDeleteButton from "@/app/admin/news/NewsDeleteButton";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";
import type { News } from "@/lib/types";
import { formatDate, NEWS_CATEGORY_LABELS, truncate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Card>
        <p className="text-red-600">お知らせの取得に失敗しました。</p>
      </Card>
    );
  }

  const rows = (items ?? []) as News[];

  return (
    <>
      <PageHeader
        title="お知らせ管理"
        description="サイトに掲載するお知らせの一覧・編集ができます。"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "お知らせ" },
        ]}
      />
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link href="/admin/news/new">
            <Button>新規作成</Button>
          </Link>
        </div>
        <Card padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr className="text-neutral-600">
                  <th className="px-4 py-3 font-medium">タイトル</th>
                  <th className="px-4 py-3 font-medium">カテゴリ</th>
                  <th className="px-4 py-3 font-medium">公開</th>
                  <th className="px-4 py-3 font-medium">日付</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-neutral-500"
                    >
                      お知らせがまだありません。
                    </td>
                  </tr>
                ) : (
                  rows.map((n) => (
                    <tr
                      key={n.id}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/news/${n.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {truncate(n.title, 48)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-neutral-700">
                        {NEWS_CATEGORY_LABELS[n.category] ?? n.category}
                      </td>
                      <td className="px-4 py-3">
                        {n.is_published ? (
                          <Badge variant="success">公開中</Badge>
                        ) : (
                          <Badge variant="default">下書き</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                        {n.published_at
                          ? formatDate(n.published_at)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link href={`/admin/news/${n.id}`}>
                            <Button variant="outline" size="sm">
                              編集
                            </Button>
                          </Link>
                          <NewsDeleteButton id={n.id} />
                        </div>
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
