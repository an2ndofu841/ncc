"use client";

import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { Member } from "@/lib/types";
import {
  MEMBER_STATUS_LABELS,
  MEMBER_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/utils";
import Link from "next/link";
import { useMemo, useState } from "react";

const ROLE_LABELS: Record<string, string> = {
  system_admin: "システム管理者",
  office_staff: "事務局",
  editor: "編集者",
  member: "一般会員",
};

export default function MembersTableClient({ members }: { members: Member[] }) {
  const [q, setQ] = useState("");
  const [referrerFilter, setReferrerFilter] = useState("");

  const referrerOptions = useMemo(() => {
    const names = new Set<string>();
    members.forEach((m) => {
      if (m.referrer_name) names.add(m.referrer_name);
    });
    return [
      { value: "", label: "すべて" },
      { value: "__none__", label: "紹介者なし" },
      ...[...names].sort().map((n) => ({ value: n, label: n })),
    ];
  }, [members]);

  const filtered = useMemo(() => {
    let result = members;

    if (referrerFilter === "__none__") {
      result = result.filter((m) => !m.referrer_name);
    } else if (referrerFilter) {
      result = result.filter((m) => m.referrer_name === referrerFilter);
    }

    const s = q.trim().toLowerCase();
    if (s) {
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(s) ||
          m.email.toLowerCase().includes(s) ||
          m.member_number.toLowerCase().includes(s) ||
          (m.referrer_name && m.referrer_name.toLowerCase().includes(s))
      );
    }

    return result;
  }, [members, q, referrerFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 max-w-md">
          <Input
            label="検索"
            placeholder="氏名・メール・会員番号・紹介者"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            label="紹介者で絞り込み"
            options={referrerOptions}
            value={referrerFilter}
            onChange={(e) => setReferrerFilter(e.target.value)}
          />
        </div>
      </div>

      {referrerFilter && (
        <p className="text-sm text-neutral-600">
          {referrerFilter === "__none__" ? "紹介者なし" : `紹介者: ${referrerFilter}`}
          {" "}— {filtered.length}件
          <button
            type="button"
            className="ml-2 text-primary hover:underline"
            onClick={() => setReferrerFilter("")}
          >
            クリア
          </button>
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr className="text-neutral-600">
              <th className="px-4 py-3 font-medium">会員番号</th>
              <th className="px-4 py-3 font-medium">氏名</th>
              <th className="px-4 py-3 font-medium">メール</th>
              <th className="px-4 py-3 font-medium">会員種別</th>
              <th className="px-4 py-3 font-medium">ステータス</th>
              <th className="px-4 py-3 font-medium">権限</th>
              <th className="px-4 py-3 font-medium">決済</th>
              <th className="px-4 py-3 font-medium">更新日</th>
              <th className="px-4 py-3 font-medium">紹介者</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-neutral-500"
                >
                  該当する会員がいません。
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/admin/members/${m.id}`}
                      className="font-mono text-sm text-primary hover:underline"
                    >
                      {m.member_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/members/${m.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{m.email}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {MEMBER_TYPE_LABELS[m.member_type] ?? m.member_type}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default">
                      {MEMBER_STATUS_LABELS[m.status] ?? m.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {ROLE_LABELS[m.role] ?? m.role}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        m.payment_status === "paid"
                          ? "success"
                          : m.payment_status === "overdue"
                            ? "warning"
                            : "default"
                      }
                    >
                      {PAYMENT_STATUS_LABELS[m.payment_status] ?? m.payment_status ?? "—"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-neutral-600">
                    {m.renewal_date ? (
                      (() => {
                        const rd = new Date(m.renewal_date);
                        const now = new Date();
                        const daysLeft = Math.ceil(
                          (rd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        const dateStr = rd.toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                        return (
                          <span
                            className={
                              daysLeft <= 0
                                ? "font-semibold text-red-600"
                                : daysLeft <= 30
                                  ? "font-semibold text-amber-600"
                                  : ""
                            }
                          >
                            {dateStr}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {m.referrer_name ? (
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => setReferrerFilter(m.referrer_name!)}
                      >
                        {m.referrer_name}
                      </button>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
