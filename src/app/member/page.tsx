import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import {
  formatDate,
  MEMBER_STATUS_LABELS,
  MEMBER_TYPE_LABELS,
  NEWS_CATEGORY_LABELS,
} from "@/lib/utils";
import type { Member, News, Seminar } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  FileText,
  Newspaper,
  UserCircle,
} from "lucide-react";

export default async function MemberDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: memberRow } = await supabase
    .from("members")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (!memberRow) redirect("/");
  const member = memberRow as Member;

  const isStaff =
    member.role === "system_admin" ||
    member.role === "office_staff" ||
    member.role === "editor";
  if (!isStaff && member.payment_status !== "paid") {
    redirect("/member/payment");
  }

  const { data: newsRows } = await supabase
    .from("news")
    .select("id, title, category, published_at, is_member_only")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(3);

  const { data: seminarRows } = await supabase
    .from("seminars")
    .select("id, title, date, venue, current_participants, capacity")
    .eq("status", "published")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(3);

  const recentNews = (newsRows ?? []) as Pick<
    News,
    "id" | "title" | "category" | "published_at" | "is_member_only"
  >[];
  const upcomingSeminars = (seminarRows ?? []) as Pick<
    Seminar,
    "id" | "title" | "date" | "venue" | "current_participants" | "capacity"
  >[];

  const btnSmSecondary =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2";
  const btnSmOutline =
    "inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";
  const btnGhostSm =
    "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2";

  return (
    <>
      <PageHeader
        title="マイページ"
        description="会員向け情報の概要です。各メニューから詳細をご確認ください。"
        breadcrumbs={[
          { label: "会員ページ", href: "/member" },
          { label: "マイページ" },
        ]}
      />

      <div className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-primary-100 bg-gradient-to-br from-white to-primary-50/40">
          <h2 className="text-lg font-bold text-primary-700">
            会員サマリー
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs font-medium text-neutral-500">お名前</dt>
              <dd className="mt-1 text-sm font-semibold text-neutral-900">
                {member.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-neutral-500">会員番号</dt>
              <dd className="mt-1 text-sm font-semibold text-neutral-900">
                {member.member_number}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-neutral-500">会員種別</dt>
              <dd className="mt-1">
                <Badge variant="info">
                  {MEMBER_TYPE_LABELS[member.member_type] ?? member.member_type}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-neutral-500">ステータス</dt>
              <dd className="mt-1">
                <Badge
                  variant={
                    member.status === "active"
                      ? "success"
                      : member.status === "withdrawn"
                        ? "default"
                        : "warning"
                  }
                >
                  {MEMBER_STATUS_LABELS[member.status] ?? member.status}
                </Badge>
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/member/profile" className={btnSmSecondary}>
              <UserCircle className="h-4 w-4" />
              会員情報を確認・編集
            </Link>
            <Link href="/member/documents" className={btnSmOutline}>
              <FileText className="h-4 w-4" />
              書類ダウンロード
            </Link>
          </div>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-primary-700">
                最近のお知らせ
              </h2>
              <Link
                href="/member/news"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light"
              >
                一覧へ
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {recentNews.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500">
                表示できるお知らせはありません。
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-neutral-100">
                {recentNews.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/member/news/${n.id}`}
                      className="flex flex-col gap-1 py-3 transition-colors hover:text-primary sm:flex-row sm:items-center sm:gap-3"
                    >
                      <span className="flex shrink-0 flex-wrap items-center gap-2 text-xs text-neutral-500">
                        {n.published_at && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(n.published_at)}
                          </span>
                        )}
                        <Badge variant="default" className="text-[10px]">
                          {NEWS_CATEGORY_LABELS[n.category] ?? n.category}
                        </Badge>
                        {n.is_member_only && (
                          <Badge variant="warning" className="text-[10px]">
                            会員限定
                          </Badge>
                        )}
                      </span>
                      <span className="text-sm font-medium text-neutral-800">
                        {n.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-primary-700">
                開催予定の研修・セミナー
              </h2>
              <Link
                href="/member/seminars"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light"
              >
                一覧へ
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {upcomingSeminars.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500">
                現在、予定されている研修・セミナーはありません。
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-neutral-100">
                {upcomingSeminars.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/member/seminars/${s.id}`}
                      className="block py-3 transition-colors hover:text-primary"
                    >
                      <p className="text-sm font-medium text-neutral-900">
                        {s.title}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {formatDate(s.date)} · {s.venue}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        定員 {s.current_participants}/{s.capacity} 名
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card className="border-dashed border-neutral-300 bg-neutral-50/50">
          <h2 className="flex items-center gap-2 text-base font-bold text-neutral-800">
            <Newspaper className="h-5 w-5 text-primary" />
            クイックリンク
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/member/profile" className={btnGhostSm}>
              連絡先の更新
            </Link>
            <Link href="/member/news" className={btnGhostSm}>
              お知らせ一覧
            </Link>
            <Link href="/member/documents" className={btnGhostSm}>
              規程・書類
            </Link>
            <Link href="/member/seminars" className={btnGhostSm}>
              申込み可能な研修
            </Link>
            <Link href="/" className={cn(btnGhostSm, "text-primary")}>
              公式サイトトップ
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
