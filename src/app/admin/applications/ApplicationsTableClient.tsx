"use client";

import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import type { Application, ApplicationStatus } from "@/lib/types";
import {
  APPLICATION_STATUS_LABELS,
  MEMBER_TYPE_LABELS,
} from "@/lib/utils";
import Link from "next/link";
import { useMemo, useState } from "react";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "すべて" },
  ...Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

export default function ApplicationsTableClient({
  applications,
}: {
  applications: Application[];
}) {
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    if (!status) return applications;
    return applications.filter((a) => a.status === status);
  }, [applications, status]);

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <Select
          label="ステータスで絞り込み"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr className="text-neutral-600">
              <th className="px-4 py-3 font-medium">お名前</th>
              <th className="px-4 py-3 font-medium">メール</th>
              <th className="px-4 py-3 font-medium">希望種別</th>
              <th className="px-4 py-3 font-medium">ステータス</th>
              <th className="px-4 py-3 font-medium">申込日</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-neutral-500"
                >
                  該当する申込みがありません。
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/applications/${a.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {a.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{a.email}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {MEMBER_TYPE_LABELS[a.desired_member_type] ??
                      a.desired_member_type}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default">
                      {APPLICATION_STATUS_LABELS[a.status as ApplicationStatus] ??
                        a.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                    {new Date(a.created_at).toLocaleDateString("ja-JP")}
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
