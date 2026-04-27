import ProfileForm from "@/components/member/ProfileForm";
import PageHeader from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function MemberProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: row, error } = await supabase
    .from("members")
    .select("id, member_number, name, member_type, status, phone, email, postal_code, address")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (error || !row) redirect("/");
  const member = row as Pick<Member, "id" | "member_number" | "name" | "member_type" | "status" | "phone" | "email" | "postal_code" | "address">;

  return (
    <>
      <PageHeader
        title="会員情報"
        description="登録内容の確認と、連絡先・住所の更新ができます。"
        breadcrumbs={[
          { label: "会員ページ", href: "/member" },
          { label: "会員情報" },
        ]}
      />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <ProfileForm member={member} />
      </div>
    </>
  );
}
