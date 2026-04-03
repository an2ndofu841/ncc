"use client";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { Contact } from "@/lib/types";
import { CONTACT_CATEGORY_LABELS, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ContactsTableClient({
  contacts,
}: {
  contacts: Contact[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleRead(c: Contact) {
    setLoadingId(c.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("contacts")
      .update({ is_read: !c.is_read })
      .eq("id", c.id);
    setLoadingId(null);
    if (error) {
      alert("更新に失敗しました: " + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50">
          <tr className="text-neutral-600">
            <th className="px-4 py-3 font-medium">お名前</th>
            <th className="px-4 py-3 font-medium">メール</th>
            <th className="px-4 py-3 font-medium">区分</th>
            <th className="px-4 py-3 font-medium">状態</th>
            <th className="px-4 py-3 font-medium">受信日</th>
            <th className="px-4 py-3 font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-10 text-center text-neutral-500"
              >
                お問い合わせはまだありません。
              </td>
            </tr>
          ) : (
            contacts.map((c) => (
              <tr
                key={c.id}
                className="border-b border-neutral-100 last:border-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/contacts/${c.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 break-all text-neutral-700">
                  {c.email}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {CONTACT_CATEGORY_LABELS[c.category] ?? c.category}
                </td>
                <td className="px-4 py-3">
                  {c.is_read ? (
                    <Badge variant="default">既読</Badge>
                  ) : (
                    <Badge variant="info">未読</Badge>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                  {formatDate(c.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={loadingId === c.id}
                    onClick={() => void toggleRead(c)}
                  >
                    {c.is_read ? "未読に戻す" : "既読にする"}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
