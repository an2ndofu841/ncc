import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import type { Seminar } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";

export default async function MemberSeminarsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("seminars")
    .select("*")
    .eq("status", "published")
    .order("date", { ascending: true });

  const seminars = (rows ?? []) as Seminar[];

  return (
    <>
      <PageHeader
        title="研修・セミナー"
        description="開催予定の研修・セミナー一覧です。詳細ページからお申込みください。"
        breadcrumbs={[
          { label: "会員ページ", href: "/member" },
          { label: "研修・セミナー" },
        ]}
      />
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {seminars.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500 shadow-sm">
            掲載中の研修・セミナーはありません。
          </p>
        ) : (
          <ul className="space-y-4">
            {seminars.map((s) => {
              const full =
                s.current_participants >= s.capacity;
              return (
                <li key={s.id}>
                  <Link
                    href={`/member/seminars/${s.id}`}
                    className="block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:border-primary-200 hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h2 className="text-lg font-bold text-primary-700">
                        {s.title}
                      </h2>
                      {full && (
                        <Badge variant="warning">定員満席</Badge>
                      )}
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                      <li className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-primary" />
                        <span>{formatDate(s.date)}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-primary" />
                        <span>{s.venue}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="h-4 w-4 shrink-0 text-primary" />
                        <span>
                          申込 {s.current_participants} / {s.capacity} 名
                        </span>
                      </li>
                      <li className="pt-1 text-neutral-800">
                        <span className="font-medium">参加費:</span>{" "}
                        {s.fee === 0
                          ? "無料"
                          : `¥${s.fee.toLocaleString("ja-JP")}（税込）`}
                      </li>
                    </ul>
                    <p className="mt-4 text-sm font-medium text-primary">
                      詳細・申込みはこちら →
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
