"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Member } from "@/lib/types";
import {
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Newspaper,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const NAV_ITEMS = [
  { href: "/member", label: "マイページ", icon: Home },
  { href: "/member/profile", label: "会員情報", icon: UserCircle },
  { href: "/member/news", label: "お知らせ", icon: Newspaper },
  { href: "/member/documents", label: "書類ダウンロード", icon: FileText },
  { href: "/member/seminars", label: "研修・セミナー", icon: GraduationCap },
] as const;

interface MemberSidebarProps {
  member: Pick<Member, "name" | "member_number">;
  /** 省略時は `usePathname()` を使用します */
  currentPath?: string;
}

export default function MemberSidebar({
  member,
  currentPath,
}: MemberSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activePath = currentPath ?? pathname;
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      activePath === href || (href !== "/member" && activePath.startsWith(href))
        ? "bg-primary text-white shadow-sm"
        : "text-neutral-700 hover:bg-primary-50 hover:text-primary-700"
    );

  return (
    <>
      {/* モバイル: 上部ナビ */}
      <div className="border-b border-neutral-200 bg-white shadow-sm md:hidden">
        <div className="border-b border-neutral-100 bg-primary-50 px-4 py-3">
          <p className="text-xs font-medium text-primary-600">会員メニュー</p>
          <p className="mt-0.5 truncate text-sm font-bold text-neutral-900">
            {member.name}
          </p>
          <p className="text-xs text-neutral-500">
            会員番号 {member.member_number}
          </p>
        </div>
        <nav
          className="flex gap-1 overflow-x-auto px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="会員エリア"
        >
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors",
                activePath === href ||
                  (href !== "/member" && activePath.startsWith(href))
                  ? "bg-primary text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-primary-100"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 pb-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            loading={loggingOut}
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </div>
      </div>

      {/* デスクトップ: サイドバー */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-200 bg-white md:flex md:min-h-screen">
        <div className="border-b border-neutral-100 bg-gradient-to-br from-primary to-primary-dark p-5 text-white">
          <p className="text-xs font-medium text-white/80">ログイン中</p>
          <p className="mt-1 truncate text-sm font-bold">{member.name}</p>
          <p className="mt-1 text-xs text-white/85">
            会員番号 {member.member_number}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="会員エリア">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.75} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-neutral-100 p-3">
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="w-full justify-start text-neutral-600 hover:text-red-700"
            loading={loggingOut}
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
          <Link
            href="/"
            className="mt-2 block text-center text-xs text-neutral-500 hover:text-primary"
          >
            サイトトップへ
          </Link>
        </div>
      </aside>
    </>
  );
}
