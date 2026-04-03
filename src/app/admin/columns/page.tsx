import ColumnDeleteButton from "@/app/admin/columns/ColumnDeleteButton";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { createServiceClient } from "@/lib/supabase/server";
import type { Column } from "@/lib/types";
import { COLUMN_CATEGORY_LABELS, formatDate, truncate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminColumnsPage() {
  const supabase = await createServiceClient();
  const { data: items, error } = await supabase
    .from("columns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <>
        <PageHeader
          title="コラム記事管理"
          description="コラムの一覧・編集ができます。"
          breadcrumbs={[
            { label: "管理画面", href: "/admin" },
            { label: "コラム" },
          ]}
        />
        <Card>
          <p className="text-red-600">
            コラム記事の取得に失敗しました。しばらくしてから再度お試しください。
          </p>
        </Card>
      </>
    );
  }

  const rows = (items ?? []) as Column[];

  return (
    <>
      <PageHeader
        title="コラム記事管理"
        description="サイトに掲載するコラム記事の一覧・編集ができます。"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "コラム" },
        ]}
      />
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link href="/admin/columns/new">
            <Button>新規作成</Button>
          </Link>
        </div>
        <Card padding={false} className="overflow-hidden border-neutral-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-gradient-to-r from-primary-50/90 to-accent/10">
                <tr className="text-neutral-600">
                  <th className="px-4 py-3 font-medium">タイトル</th>
                  <th className="px-4 py-3 font-medium">カテゴリ</th>
                  <th className="px-4 py-3 font-medium">公開状態</th>
                  <th className="px-4 py-3 font-medium">公開日</th>
                  <th className="px-4 py-3 font-medium">閲覧</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-neutral-500"
                    >
                      コラム記事がまだありません。
                    </td>
                  </tr>
                ) : (
                  rows.map((col) => (
                    <tr
                      key={col.id}
                      className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/80"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/columns/${col.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {truncate(col.title, 48)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="info">
                          {COLUMN_CATEGORY_LABELS[col.category] ?? col.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {col.is_published ? (
                          <Badge variant="success">公開</Badge>
                        ) : (
                          <Badge variant="default">下書き</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                        {col.published_at ? formatDate(col.published_at) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {col.is_member_only ? (
                          <Badge variant="warning">会員限定</Badge>
                        ) : (
                          <span className="text-xs text-neutral-500">全体</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link href={`/admin/columns/${col.id}`}>
                            <Button variant="outline" size="sm">
                              編集
                            </Button>
                          </Link>
                          <ColumnDeleteButton columnId={col.id} />
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
