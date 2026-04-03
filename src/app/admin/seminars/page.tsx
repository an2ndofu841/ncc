import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { createServiceClient } from "@/lib/supabase/server";
import type { Seminar } from "@/lib/types";
import Link from "next/link";

const SEMINAR_STATUS_LABELS: Record<string, string> = {
  draft: "下書き",
  published: "公開中",
  closed: "終了",
  cancelled: "中止",
};

export default async function AdminSeminarsPage() {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("seminars")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    return (
      <Card>
        <p className="text-red-600">
          セミナー一覧の取得に失敗しました。権限をご確認ください。
        </p>
      </Card>
    );
  }

  const rows = (data ?? []) as Seminar[];

  return (
    <>
      <PageHeader
        title="セミナー管理"
        description="研修・セミナーの登録・編集ができます。"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "セミナー" },
        ]}
      />
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-end">
          <Link href="/admin/seminars/new">
            <Button>新規作成</Button>
          </Link>
        </div>
        <Card padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr className="text-neutral-600">
                  <th className="px-4 py-3 font-medium">タイトル</th>
                  <th className="px-4 py-3 font-medium">開催日</th>
                  <th className="px-4 py-3 font-medium">定員</th>
                  <th className="px-4 py-3 font-medium">ステータス</th>
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
                      セミナーがまだありません。
                    </td>
                  </tr>
                ) : (
                  rows.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/seminars/${s.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {s.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-neutral-700">
                        {new Date(s.date).toLocaleString("ja-JP")}
                      </td>
                      <td className="px-4 py-3 text-neutral-700">
                        {s.current_participants} / {s.capacity}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">
                          {SEMINAR_STATUS_LABELS[s.status] ?? s.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/seminars/${s.id}`}>
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
