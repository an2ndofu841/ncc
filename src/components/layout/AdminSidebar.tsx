"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  FileText,
  GraduationCap,
  FolderOpen,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";

const NAV = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/admin/news", label: "お知らせ管理", icon: Newspaper },
  { href: "/admin/members", label: "会員管理", icon: Users },
  { href: "/admin/applications", label: "申込み管理", icon: FileText },
  { href: "/admin/seminars", label: "セミナー管理", icon: GraduationCap },
  { href: "/admin/documents", label: "書類管理", icon: FolderOpen },
  { href: "/admin/contacts", label: "お問い合わせ", icon: MessageSquare },
  { href: "/admin/pages", label: "固定ページ", icon: FileText },
  { href: "/admin/settings", label: "設定", icon: Settings },
] as const;

function isActive(currentPath: string, href: string) {
  if (href === "/admin") return currentPath === "/admin";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function AdminSidebar({
  currentPath,
}: {
  currentPath?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
    setLoggingOut(false);
  }

  const pathForNav = currentPath ?? pathname ?? "";

  const sidebarInner = (
    <>
      <div className="border-b border-neutral-200 px-4 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          管理画面
        </p>
        <p className="mt-1 text-lg font-bold text-primary-700">NCC 組合</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathForNav ? isActive(pathForNav, href) : false;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-100 text-primary-800"
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-neutral-200 p-3">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-3 text-neutral-700"
          onClick={handleLogout}
          loading={loggingOut}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          ログアウト
        </Button>
      </div>
    </>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <span className="font-semibold text-primary-700">管理メニュー</span>
        <button
          type="button"
          className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100"
          aria-expanded={open}
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="オーバーレイを閉じる"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-neutral-200 bg-white shadow-lg transition-transform lg:static lg:z-0 lg:max-w-none lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarInner}
      </aside>
    </>
  );
}
