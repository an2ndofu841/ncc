"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const NAV_ITEMS = [
  { label: "ホーム", href: "/" },
  {
    label: "組合について",
    children: [
      { label: "組合概要", href: "/about" },
      { label: "理事長あいさつ", href: "/greeting" },
      { label: "活動内容", href: "/activities" },
    ],
  },
  {
    label: "入会案内",
    children: [
      { label: "入会のご案内", href: "/membership" },
      { label: "会員種別・会費", href: "/membership-types" },
      { label: "入会申込み", href: "/apply" },
    ],
  },
  { label: "コラム", href: "/columns" },
  { label: "お知らせ", href: "/news" },
  { label: "よくある質問", href: "/faq" },
  { label: "加盟院検索", href: "/search" },
  { label: "お問い合わせ", href: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
              全
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-primary leading-tight">
                全日本カイロプラクティック
              </p>
              <p className="text-xs text-neutral-500 leading-tight">
                施術協同組合
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary rounded-md hover:bg-neutral-50 transition-colors">
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {openDropdown === item.label && (
                    <div className="absolute left-0 top-full w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  className="px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary rounded-md hover:bg-neutral-50 transition-colors"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-50 transition-colors"
            >
              会員ログイン
            </Link>
            <button
              className="lg:hidden p-2 text-neutral-600 hover:text-primary"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="メニュー"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white">
          <nav className="mx-auto max-w-6xl px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <p className="px-3 py-2 text-sm font-semibold text-neutral-500">
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-6 py-2 text-sm text-neutral-700 hover:text-primary hover:bg-primary-50 rounded-md"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  className="block px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary hover:bg-primary-50 rounded-md"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="pt-3 border-t border-neutral-200">
              <Link
                href="/auth/login"
                className="block px-3 py-2 text-sm font-medium text-primary"
                onClick={() => setMobileOpen(false)}
              >
                会員ログイン
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
