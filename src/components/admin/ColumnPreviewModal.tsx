"use client";

import { COLUMN_CATEGORY_LABELS } from "@/lib/utils";
import type { ColumnCategory } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ColumnPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
  category: ColumnCategory;
  authorName?: string;
  thumbnailUrl?: string;
  tags?: string[];
}

export default function ColumnPreviewModal({
  open,
  onClose,
  title,
  content,
  category,
  authorName,
  thumbnailUrl,
  tags,
}: ColumnPreviewModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-neutral-200 bg-white/95 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <Badge
              variant="default"
              className="border border-amber-300 bg-amber-50 text-amber-700"
            >
              プレビュー
            </Badge>
            <span className="text-sm text-neutral-500">公開前の確認用</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
          >
            <X size={20} />
          </button>
        </div>

        <article className="px-6 py-8 sm:px-10">
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            {title || "（タイトル未入力）"}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge
              variant="default"
              className="border border-primary-200 bg-primary-50 text-primary-700"
            >
              {COLUMN_CATEGORY_LABELS[category] ?? category}
            </Badge>
            <span className="text-sm text-neutral-500">
              {new Date().toLocaleDateString("ja-JP")}
            </span>
            {authorName && (
              <span className="text-sm text-neutral-700">
                <span className="text-neutral-500">執筆</span>{" "}
                <span className="font-medium">{authorName}</span>
              </span>
            )}
          </div>

          {thumbnailUrl && (
            <figure className="mt-6 overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt={title}
                className="aspect-[16/9] w-full object-cover sm:aspect-[2/1]"
              />
            </figure>
          )}

          <div className="mt-6 border-t border-neutral-200 pt-6" />

          <div
            className="column-content text-neutral-800"
            dangerouslySetInnerHTML={{ __html: content || "<p>（本文未入力）</p>" }}
          />

          {tags && tags.length > 0 && (
            <footer className="mt-10 border-t border-neutral-200 pt-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                タグ
              </h2>
              <ul className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <li key={tag}>
                    <Badge
                      variant="default"
                      className="rounded-md border border-accent/30 bg-[#faf6eb] px-2 py-0.5 text-xs font-normal text-[#6b5a2e]"
                    >
                      {tag}
                    </Badge>
                  </li>
                ))}
              </ul>
            </footer>
          )}
        </article>
      </div>
    </div>
  );
}
