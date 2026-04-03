import AdminSidebar from "@/components/layout/AdminSidebar";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const ADMIN_ROLES = ["system_admin", "office_staff", "editor"] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const service = await createServiceClient();
  const { data: member } = await service
    .from("members")
    .select("role")
    .eq("auth_id", user.id)
    .single();

  if (
    !member ||
    !ADMIN_ROLES.includes(
      member.role as (typeof ADMIN_ROLES)[number]
    )
  ) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col bg-neutral-50 lg:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
