"use client";

import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";
import type { Contact } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ContactDetailClient({ contact }: { contact: Contact }) {
  const router = useRouter();
  const [adminNotes, setAdminNotes] = useState(contact.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function saveNotes() {
    setSaving(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("contacts")
      .update({ admin_notes: adminNotes.trim() || null })
      .eq("id", contact.id);
    setSaving(false);
    if (error) {
      setMsg("保存に失敗しました: " + error.message);
      return;
    }
    setMsg("管理者メモを保存しました。");
    router.refresh();
  }

  async function markRead(read: boolean) {
    setMarking(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("contacts")
      .update({ is_read: read })
      .eq("id", contact.id);
    setMarking(false);
    if (error) {
      setMsg("更新に失敗しました: " + error.message);
      return;
    }
    setMsg(read ? "既読にしました。" : "未読に戻しました。");
    router.refresh();
  }

  return (
    <div className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      {msg && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          {msg}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {!contact.is_read ? (
          <Button
            type="button"
            onClick={() => void markRead(true)}
            loading={marking}
          >
            既読にする
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => void markRead(false)}
            loading={marking}
          >
            未読に戻す
          </Button>
        )}
      </div>
      <Textarea
        label="管理者メモ（内部共有用）"
        rows={5}
        value={adminNotes}
        onChange={(e) => setAdminNotes(e.target.value)}
      />
      <Button type="button" onClick={() => void saveNotes()} loading={saving}>
        メモを保存
      </Button>
    </div>
  );
}
