import MemberSidebar from "@/components/layout/MemberSidebar";
import { createClient } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function MemberLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: memberRow, error } = await supabase
    .from("members")
    .select("id, name, member_number, payment_status, role")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (error || !memberRow) {
    redirect("/");
  }

  const member = memberRow as Pick<
    Member,
    "id" | "name" | "member_number" | "payment_status" | "role"
  >;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 md:flex-row">
      <MemberSidebar member={member} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
