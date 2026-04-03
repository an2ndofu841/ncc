import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";
import {
  APPLICATION_STATUS_LABELS,
  CONTACT_CATEGORY_LABELS,
  formatDate,
} from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    membersCount,
    unreviewedApps,
    unreadContacts,
    publishedNews,
    recentApps,
    recentContacts,
  ] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "unreviewed"),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false),
    supabase
      .from("news")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("applications")
      .select("id, name, email, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contacts")
      .select("id, name, email, category, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "会員数", value: membersCount.count ?? 0, href: "/admin/members" },
    {
      label: "未確認の申込み",
      value: unreviewedApps.count ?? 0,
      href: "/admin/applications",
    },
    {
      label: "未読のお問い合わせ",
      value: unreadContacts.count ?? 0,
      href: "/admin/contacts",
    },
    {
      label: "公開中のお知らせ",
      value: publishedNews.count ?? 0,
      href: "/admin/news",
    },
  ];

  return (
    <>
      <PageHeader
        title="ダッシュボード"
        description="組合サイトの管理概要です。"
        breadcrumbs={[{ label: "管理画面", href: "/admin" }]}
      />
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <p className="text-sm font-medium text-neutral-500">{s.label}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-primary-700">
                  {s.value}
                </p>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-neutral-900">
                最近の申込み
              </h2>
              <Link
                href="/admin/applications"
                className="text-sm font-medium text-primary hover:underline"
              >
                一覧へ
              </Link>
            </div>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500">
                    <th className="pb-2 pr-4 font-medium">お名前</th>
                    <th className="pb-2 pr-4 font-medium">ステータス</th>
                    <th className="pb-2 font-medium">日付</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentApps.data ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-6 text-center text-neutral-500"
                      >
                        申込みはまだありません。
                      </td>
                    </tr>
                  ) : (
                    (recentApps.data ?? []).map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-neutral-100 last:border-0"
                      >
                        <td className="py-3 pr-4">
                          <Link
                            href={`/admin/applications/${row.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {row.name}
                          </Link>
                          <div className="text-xs text-neutral-500">
                            {row.email}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-neutral-700">
                          {APPLICATION_STATUS_LABELS[row.status] ?? row.status}
                        </td>
                        <td className="py-3 whitespace-nowrap text-neutral-600">
                          {formatDate(row.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-neutral-900">
                最近のお問い合わせ
              </h2>
              <Link
                href="/admin/contacts"
                className="text-sm font-medium text-primary hover:underline"
              >
                一覧へ
              </Link>
            </div>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500">
                    <th className="pb-2 pr-4 font-medium">お名前</th>
                    <th className="pb-2 pr-4 font-medium">区分</th>
                    <th className="pb-2 font-medium">日付</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentContacts.data ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-6 text-center text-neutral-500"
                      >
                        お問い合わせはまだありません。
                      </td>
                    </tr>
                  ) : (
                    (recentContacts.data ?? []).map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-neutral-100 last:border-0"
                      >
                        <td className="py-3 pr-4">
                          <Link
                            href={`/admin/contacts/${row.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {row.name}
                          </Link>
                          {!row.is_read && (
                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                              未読
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-neutral-700">
                          {CONTACT_CATEGORY_LABELS[row.category] ??
                            row.category}
                        </td>
                        <td className="py-3 whitespace-nowrap text-neutral-600">
                          {formatDate(row.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
