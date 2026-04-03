import SeminarEditForm from "@/app/admin/seminars/[id]/SeminarEditForm";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { createServiceClient } from "@/lib/supabase/server";
import type { Member, Seminar, SeminarRegistration } from "@/lib/types";
import { MEMBER_TYPE_LABELS } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function AdminSeminarEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const { data: seminarRow, error: sErr } = await supabase
    .from("seminars")
    .select("*")
    .eq("id", id)
    .single();

  if (sErr || !seminarRow) {
    notFound();
  }

  const seminar = seminarRow as Seminar;

  const { data: regs } = await supabase
    .from("seminar_registrations")
    .select("id, created_at, member_id")
    .eq("seminar_id", id)
    .order("created_at", { ascending: false });

  const memberIds = [...new Set((regs ?? []).map((r) => r.member_id))];
  const { data: mems } =
    memberIds.length > 0
      ? await supabase.from("members").select("*").in("id", memberIds)
      : { data: [] as Member[] };
  const membersById = Object.fromEntries(
    ((mems ?? []) as Member[]).map((m) => [m.id, m])
  ) as Record<string, Member>;

  const registrations = (regs ?? []) as SeminarRegistration[];

  return (
    <>
      <PageHeader
        title="セミナー編集"
        description={seminar.title}
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "セミナー", href: "/admin/seminars" },
          { label: "編集" },
        ]}
      />
      <div className="mx-auto max-w-6xl space-y-8">
        <SeminarEditForm seminar={seminar} />

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            申込済み参加者（{registrations.length} 名）
          </h2>
          <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-neutral-200 text-neutral-500">
                <tr>
                  <th className="pb-2 pr-4 font-medium">氏名</th>
                  <th className="pb-2 pr-4 font-medium">会員番号</th>
                  <th className="pb-2 pr-4 font-medium">種別</th>
                  <th className="pb-2 font-medium">申込日時</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-neutral-500">
                      まだ申込者はいません。
                    </td>
                  </tr>
                ) : (
                  registrations.map((r) => {
                    const m = membersById[r.member_id];
                    return (
                      <tr
                        key={r.id}
                        className="border-b border-neutral-100 last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium text-neutral-900">
                          {m?.name ?? "（会員情報なし）"}
                        </td>
                        <td className="py-3 pr-4 font-mono text-neutral-700">
                          {m?.member_number ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-neutral-700">
                          {m
                            ? MEMBER_TYPE_LABELS[m.member_type] ?? m.member_type
                            : "—"}
                        </td>
                        <td className="py-3 whitespace-nowrap text-neutral-600">
                          {new Date(r.created_at).toLocaleString("ja-JP")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
