import SeminarRegisterButton from "@/components/member/SeminarRegisterButton";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import type { Member, Seminar } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, User, Users } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberSeminarDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: memberRow } = await supabase
    .from("members")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (!memberRow) redirect("/");
  const memberId = (memberRow as Pick<Member, "id">).id;

  const { data: seminarRow, error: seminarError } = await supabase
    .from("seminars")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (seminarError || !seminarRow) {
    notFound();
  }

  const seminar = seminarRow as Seminar;

  const { data: regRow } = await supabase
    .from("seminar_registrations")
    .select("id")
    .eq("seminar_id", id)
    .eq("member_id", memberId)
    .maybeSingle();

  const alreadyRegistered = !!regRow;

  const now = new Date();
  const eventDate = new Date(seminar.date);
  const pastEvent = eventDate < now;
  const deadlinePassed =
    seminar.deadline != null && new Date(seminar.deadline) < now;
  const full = seminar.current_participants >= seminar.capacity;

  let disabled = false;
  let disabledReason: string | undefined;

  if (pastEvent) {
    disabled = true;
    disabledReason = "開催日を過ぎているため、お申込みできません。";
  } else if (deadlinePassed) {
    disabled = true;
    disabledReason = "申込締切を過ぎています。";
  } else if (full) {
    disabled = true;
    disabledReason = "定員に達しているため、お申込みを受け付けておりません。";
  }

  return (
    <>
      <PageHeader
        title={seminar.title}
        description="開催概要とお申込みは以下をご確認ください。"
        breadcrumbs={[
          { label: "会員ページ", href: "/member" },
          { label: "研修・セミナー", href: "/member/seminars" },
          { label: "詳細" },
        ]}
      />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/member/seminars"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-light"
        >
          <ArrowLeft className="h-4 w-4" />
          一覧に戻る
        </Link>

        <div className="space-y-6">
          <Card className="border-primary-100">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3 sm:col-span-2">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs font-medium text-neutral-500">
                    開催日時
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-neutral-900">
                    {formatDate(seminar.date)}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs font-medium text-neutral-500">会場</dt>
                  <dd className="mt-1 text-sm font-semibold text-neutral-900">
                    {seminar.venue}
                  </dd>
                </div>
              </div>
              {seminar.instructor && (
                <div className="flex gap-3 sm:col-span-2">
                  <User className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <dt className="text-xs font-medium text-neutral-500">
                      講師
                    </dt>
                    <dd className="mt-1 text-sm text-neutral-800">
                      {seminar.instructor}
                    </dd>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs font-medium text-neutral-500">
                    定員 / 申込状況
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-neutral-900">
                    {seminar.current_participants} / {seminar.capacity} 名
                    {full && (
                      <Badge variant="warning" className="ml-2">
                        満席
                      </Badge>
                    )}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-medium text-neutral-500">
                  参加費
                </dt>
                <dd className="mt-1 text-sm font-semibold text-neutral-900">
                  {seminar.fee === 0
                    ? "無料"
                    : `¥${seminar.fee.toLocaleString("ja-JP")}（税込）`}
                </dd>
              </div>
              {seminar.deadline && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-neutral-500">
                    申込締切
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-800">
                    {formatDate(seminar.deadline)}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-primary-700">内容・注意事項</h2>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
              {seminar.description}
            </div>
          </Card>

          <Card className="border-dashed border-primary-200 bg-primary-50/30">
            <h2 className="text-lg font-bold text-primary-700">お申込み</h2>
            <p className="mt-2 text-sm text-neutral-600">
              申込後は事務局からの連絡をお待ちください。キャンセルは事務局までご連絡ください。
            </p>
            <div className="mt-6">
              <SeminarRegisterButton
                seminarId={seminar.id}
                memberId={memberId}
                disabled={disabled}
                disabledReason={disabledReason}
                alreadyRegistered={alreadyRegistered}
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
