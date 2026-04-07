"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Construction,
  Loader2,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";

export default function MaintenanceToggle({
  initialValue,
  initialPreviewKey,
}: {
  initialValue: boolean;
  initialPreviewKey: string | null;
}) {
  const [enabled, setEnabled] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(initialPreviewKey);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

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

  function getPreviewUrl() {
    if (!previewKey) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/?preview_key=${encodeURIComponent(previewKey)}`;
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(getPreviewUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("コピーに失敗しました");
    }
  }

  async function regenerateKey() {
    if (!confirm("プレビューキーを再生成しますか？\n以前のURLは無効になります。")) return;
    setRegenerating(true);
    const newKey = `ncc-${crypto.randomUUID().slice(0, 12)}`;
    const supabase = createClient();
    const { error } = await supabase
      .from("site_settings")
      .update({ value: newKey, updated_at: new Date().toISOString() })
      .eq("key", "preview_key");

    setRegenerating(false);
    if (error) {
      alert("再生成に失敗しました: " + error.message);
      return;
    }
    setPreviewKey(newKey);
  }

  return (
    <div
      className={`rounded-xl border shadow-sm transition-colors ${
        enabled ? "border-amber-300 bg-amber-50" : "border-neutral-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              enabled
                ? "bg-amber-200 text-amber-700"
                : "bg-neutral-100 text-neutral-500"
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

      {enabled && previewKey && (
        <div className="border-t border-amber-200 px-4 py-3">
          <p className="mb-2 text-xs font-semibold text-amber-700">
            関係者用プレビューURL（このURLでアクセスするとメンテナンス画面をスキップできます）
          </p>
          <div className="flex items-stretch gap-2">
            <input
              type="text"
              readOnly
              value={getPreviewUrl()}
              className="min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs text-neutral-700 focus:outline-none"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={copyUrl}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  コピー済み
                </>
              ) : (
                <>
                  <Copy size={14} />
                  コピー
                </>
              )}
            </button>
            <button
              type="button"
              onClick={regenerateKey}
              disabled={regenerating}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-60"
              title="キーを再生成（以前のURLは無効になります）"
            >
              <RefreshCw
                size={14}
                className={regenerating ? "animate-spin" : ""}
              />
              再生成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
