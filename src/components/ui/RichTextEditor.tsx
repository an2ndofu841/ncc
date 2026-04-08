"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { CalloutBox } from "@/components/ui/tiptap/CalloutBoxExtension";
import { SupervisorComment } from "@/components/ui/tiptap/SupervisorCommentExtension";
import { useCallback, useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Unlink,
  Table as TableIcon,
  TableCellsMerge,
  Trash2,
  Plus,
  Highlighter,
  StickyNote,
  MessageCircle,
  Maximize,
  Minimize,
  Eye,
  ListTree,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  previewUrl?: string;
}

function MenuButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "rounded p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors disabled:opacity-30",
        active && "bg-primary-50 text-primary"
      )}
    >
      {children}
    </button>
  );
}

function CalloutDropdown({ editor, size }: { editor: Editor; size: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const insert = (boxStyle: string, title = "POINT") => {
    editor.chain().focus().insertCalloutBox({ boxStyle, title }).run();
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <MenuButton
        onClick={() => setOpen(!open)}
        active={editor.isActive("calloutBox")}
        title="ボックス挿入"
      >
        <StickyNote size={size} />
      </MenuButton>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-52 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
          <p className="mb-1.5 px-2 text-[11px] font-semibold text-neutral-400">
            ボックスを挿入
          </p>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm hover:bg-primary-50"
            onClick={() => insert("style1")}
          >
            <span className="flex h-8 w-10 shrink-0 items-start rounded border-2 border-blue-300 p-0.5">
              <span className="rounded bg-blue-300 px-0.5 text-[7px] leading-none text-white">
                T
              </span>
            </span>
            <span className="text-neutral-700">ラベル付き枠線</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm hover:bg-primary-50"
            onClick={() => insert("style2")}
          >
            <span className="flex h-8 w-10 shrink-0 flex-col overflow-hidden rounded border-2 border-blue-300">
              <span className="flex h-3 items-center justify-center bg-blue-300 text-[6px] leading-none text-white">
                T
              </span>
              <span className="flex-1" />
            </span>
            <span className="text-neutral-700">ヘッダー付きボックス</span>
          </button>

          <p className="mb-1 mt-2 border-t border-neutral-100 px-2 pt-2 text-[11px] font-semibold text-neutral-400">
            シンプルボックス
          </p>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm hover:bg-primary-50"
            onClick={() => insert("style3", "")}
          >
            <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded border-2 border-gray-300">
              <span className="h-1 w-5 rounded-full bg-gray-300" />
            </span>
            <span className="text-neutral-700">枠線のみ</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm hover:bg-primary-50"
            onClick={() => insert("style4", "")}
          >
            <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded bg-gray-100">
              <span className="h-1 w-5 rounded-full bg-gray-300" />
            </span>
            <span className="text-neutral-700">背景グレー</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm hover:bg-primary-50"
            onClick={() => insert("style5", "")}
          >
            <span className="flex h-8 w-10 shrink-0 items-center rounded border-l-[3px] border-blue-300 bg-blue-50 pl-1.5">
              <span className="h-1 w-4 rounded-full bg-blue-200" />
            </span>
            <span className="text-neutral-700">左線アクセント</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm hover:bg-primary-50"
            onClick={() => insert("style6", "")}
          >
            <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded border-2 border-amber-300 bg-amber-50">
              <span className="h-1 w-5 rounded-full bg-amber-300" />
            </span>
            <span className="text-neutral-700">注意・補足</span>
          </button>
        </div>
      )}
    </div>
  );
}

const HIGHLIGHT_COLORS = [
  { color: "#fef08a", label: "黄色", ring: "ring-yellow-300" },
  { color: "#a5f3fc", label: "水色", ring: "ring-cyan-300" },
  { color: "#bbf7d0", label: "緑", ring: "ring-green-300" },
  { color: "#fca5a5", label: "赤", ring: "ring-red-300" },
];

function HighlightDropdown({ editor, size }: { editor: Editor; size: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <MenuButton
        onClick={() => setOpen(!open)}
        active={editor.isActive("highlight")}
        title="蛍光マーカー"
      >
        <Highlighter size={size} />
      </MenuButton>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
          <p className="mb-1.5 px-1 text-[11px] font-semibold text-neutral-400">
            マーカー色
          </p>
          <div className="flex gap-1.5">
            {HIGHLIGHT_COLORS.map((h) => (
              <button
                key={h.color}
                type="button"
                title={h.label}
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .toggleHighlight({ color: h.color })
                    .run();
                  setOpen(false);
                }}
                className={cn(
                  "h-7 w-7 rounded-full border-2 border-white ring-2 ring-transparent transition-all hover:scale-110",
                  editor.isActive("highlight", { color: h.color }) && h.ring
                )}
                style={{ background: h.color }}
              />
            ))}
            {editor.isActive("highlight") && (
              <button
                type="button"
                title="マーカー解除"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setOpen(false);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-xs text-neutral-500 hover:bg-neutral-100"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const STYLED_LISTS = [
  {
    label: "ボックスあり",
    items: [
      { style: "pointer", name: "▶ 三角（緑枠）", border: "border-emerald-400", bg: "" },
      { style: "paw", name: "● 丸印（ピンク枠）", border: "border-red-300", bg: "bg-red-50" },
      { style: "check", name: "✓ チェック（オレンジ枠）", border: "border-amber-400", bg: "" },
      { style: "memo", name: "― ダッシュ（青点線枠）", border: "border-blue-300 border-dashed", bg: "bg-blue-50" },
    ],
  },
  {
    label: "ボックスなし",
    items: [
      { style: "pointer-plain", name: "▶ 三角", border: "", bg: "" },
      { style: "paw-plain", name: "● 丸印", border: "", bg: "" },
      { style: "check-plain", name: "✓ チェック", border: "", bg: "" },
      { style: "memo-plain", name: "― ダッシュ", border: "", bg: "" },
    ],
  },
];

function StyledListDropdown({ editor, size }: { editor: Editor; size: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const insert = (boxStyle: string) => {
    editor.chain().focus().insertCalloutBox({ boxStyle, title: "" }).run();
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <MenuButton
        onClick={() => setOpen(!open)}
        active={false}
        title="装飾リスト"
      >
        <ListTree size={size} />
      </MenuButton>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
          {STYLED_LISTS.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <div className="my-1.5 border-t border-neutral-100" />}
              <p className="mb-1 px-2 text-[11px] font-semibold text-neutral-400">
                {group.label}
              </p>
              {group.items.map((item) => (
                <button
                  key={item.style}
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-primary-50"
                  onClick={() => insert(item.style)}
                >
                  <span
                    className={cn(
                      "flex h-7 w-9 shrink-0 flex-col justify-center gap-1 rounded px-1",
                      item.border && `border-2 ${item.border}`,
                      item.bg
                    )}
                  >
                    <ListIcon type={item.style.replace("-plain", "")} />
                    <ListIcon type={item.style.replace("-plain", "")} />
                  </span>
                  <span className="text-neutral-700">{item.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ListIcon({ type }: { type: string }) {
  const base = "flex items-center gap-1";
  if (type === "pointer")
    return (
      <span className={base}>
        <span className="inline-block h-0 w-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-emerald-400" />
        <span className="h-px flex-1 bg-neutral-300" />
      </span>
    );
  if (type === "paw")
    return (
      <span className={base}>
        <span className="inline-block h-[6px] w-[6px] rounded-full bg-red-400" />
        <span className="h-px flex-1 bg-neutral-300" />
      </span>
    );
  if (type === "check")
    return (
      <span className={base}>
        <span className="inline-block h-[7px] w-[4px] rotate-45 border-b-[1.5px] border-r-[1.5px] border-green-500" />
        <span className="h-px flex-1 bg-neutral-300" />
      </span>
    );
  return (
    <span className={base}>
      <span className="inline-block h-0 w-[6px] border-t-[1.5px] border-blue-400" />
      <span className="h-px flex-1 bg-neutral-300" />
    </span>
  );
}

function MenuBar({
  editor,
  fullscreen,
  onToggleFullscreen,
  previewUrl,
}: {
  editor: Editor;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  previewUrl?: string;
}) {
  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URLを入力", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const addImage = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `columns/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("uploads")
        .upload(path, file, { contentType: file.type });
      if (error) {
        alert("画像のアップロードに失敗しました");
        return;
      }
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      editor.chain().focus().setImage({ src: data.publicUrl }).run();
    };
    input.click();
  }, [editor]);

  const s = 16;

  return (
    <div className="sticky top-0 z-20 rounded-t-lg border-b border-neutral-200 bg-neutral-50">
      {/* Row 1: テキスト装飾 + 見出し + リスト・引用 */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="太字"
        >
          <Bold size={s} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="斜体"
        >
          <Italic size={s} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="下線"
        >
          <UnderlineIcon size={s} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="取り消し線"
        >
          <Strikethrough size={s} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="インラインコード"
        >
          <Code size={s} />
        </MenuButton>
        <HighlightDropdown editor={editor} size={s} />

        <div className="mx-1 h-5 w-px bg-neutral-300" />

        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="見出し1"
        >
          <Heading1 size={s} />
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="見出し2"
        >
          <Heading2 size={s} />
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="見出し3"
        >
          <Heading3 size={s} />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-neutral-300" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="箇条書き"
        >
          <List size={s} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="番号リスト"
        >
          <ListOrdered size={s} />
        </MenuButton>
        <StyledListDropdown editor={editor} size={s} />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="引用"
        >
          <Quote size={s} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="区切り線"
        >
          <Minus size={s} />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-neutral-300" />

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="元に戻す"
        >
          <Undo size={s} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="やり直し"
        >
          <Redo size={s} />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-neutral-300" />

        <MenuButton
          onClick={onToggleFullscreen}
          active={fullscreen}
          title={fullscreen ? "全画面を終了" : "全画面で編集"}
        >
          {fullscreen ? <Minimize size={s} /> : <Maximize size={s} />}
        </MenuButton>

        {previewUrl && (
          <MenuButton
            onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}
            title="プレビュー（別タブ）"
          >
            <Eye size={s} />
          </MenuButton>
        )}
      </div>

      {/* Row 2: 配置 + リンク・画像 + 表・ボックス */}
      <div className="flex flex-wrap items-center gap-0.5 border-t border-neutral-200/70 px-2 py-1">
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="左揃え"
        >
          <AlignLeft size={s} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="中央揃え"
        >
          <AlignCenter size={s} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="右揃え"
        >
          <AlignRight size={s} />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-neutral-300" />

        <MenuButton
          onClick={setLink}
          active={editor.isActive("link")}
          title="リンク"
        >
          <LinkIcon size={s} />
        </MenuButton>
        {editor.isActive("link") && (
          <MenuButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="リンク解除"
          >
            <Unlink size={s} />
          </MenuButton>
        )}
        <MenuButton onClick={addImage} title="画像挿入">
          <ImageIcon size={s} />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-neutral-300" />

        <MenuButton
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          active={editor.isActive("table")}
          title="表を挿入"
        >
          <TableIcon size={s} />
        </MenuButton>
        {editor.isActive("table") && (
          <>
            <MenuButton
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="右に列を追加"
            >
              <Plus size={s} />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="下に行を追加"
            >
              <Plus size={s} className="rotate-90" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().mergeCells().run()}
              title="セルを結合"
            >
              <TableCellsMerge size={s} />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="表を削除"
            >
              <Trash2 size={s} />
            </MenuButton>
          </>
        )}

        <CalloutDropdown editor={editor} size={s} />

        <MenuButton
          onClick={() => editor.chain().focus().insertSupervisorComment().run()}
          active={editor.isActive("supervisorComment")}
          title="監修者コメント"
        >
          <MessageCircle size={s} />
        </MenuButton>
      </div>
    </div>
  );
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "記事の本文を入力してください…",
  previewUrl,
}: RichTextEditorProps) {
  const [fullscreen, setFullscreen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: { class: "text-primary underline" },
        },
        underline: {},
      }),
      Highlight.configure({ multicolor: true }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "rounded-lg max-w-full mx-auto" },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "tiptap-table" },
      }),
      TableRow,
      TableHeader,
      TableCell,
      CalloutBox,
      SupervisorComment,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none px-4 py-3 min-h-[400px] focus:outline-none",
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  useEffect(() => {
    if (!fullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  if (!editor) return null;

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        <MenuBar
          editor={editor}
          fullscreen={fullscreen}
          onToggleFullscreen={() => setFullscreen(false)}
          previewUrl={previewUrl}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-300 bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
      <MenuBar
        editor={editor}
        fullscreen={fullscreen}
        onToggleFullscreen={() => setFullscreen(true)}
        previewUrl={previewUrl}
      />
      <EditorContent editor={editor} />
    </div>
  );
}
