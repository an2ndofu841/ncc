"use client";

import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import type { Member } from "@/lib/types";
import {
  MEMBER_STATUS_LABELS,
  MEMBER_TYPE_LABELS,
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

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(s) ||
        m.email.toLowerCase().includes(s) ||
        m.member_number.toLowerCase().includes(s)
    );
  }, [members, q]);

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <Input
          label="検索"
          placeholder="氏名・メール・会員番号"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr className="text-neutral-600">
              <th className="px-4 py-3 font-medium">会員番号</th>
              <th className="px-4 py-3 font-medium">氏名</th>
              <th className="px-4 py-3 font-medium">メール</th>
              <th className="px-4 py-3 font-medium">会員種別</th>
              <th className="px-4 py-3 font-medium">ステータス</th>
              <th className="px-4 py-3 font-medium">権限</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
