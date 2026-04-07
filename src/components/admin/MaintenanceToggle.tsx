"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Construction, Loader2 } from "lucide-react";

export default function MaintenanceToggle({
  initialValue,
}: {
  initialValue: boolean;
}) {
  const [enabled, setEnabled] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !enabled;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("site_settings")
      .update({ value: next, updated_at: new Date().toISOString() })
      .eq("key", "maintenance_mode");

    setSaving(false);
    if (error) {
      alert("更新に失敗しました: " + error.message);
      return;
    }
    setEnabled(next);
  }

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm transition-colors ${
        enabled
          ? "border-amber-300 bg-amber-50"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            enabled ? "bg-amber-200 text-amber-700" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          <Construction size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            メンテナンスモード
          </p>
          <p className="text-xs text-neutral-500">
            {enabled
              ? "公開サイトにメンテナンス画面を表示中"
              : "公開サイトは通常表示されています"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 ${
          enabled ? "bg-amber-500" : "bg-neutral-300"
        }`}
      >
        {saving ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={14} className="animate-spin text-white" />
          </span>
        ) : (
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        )}
      </button>
    </div>
  );
}
