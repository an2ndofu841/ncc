"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { CalloutBox } from "@/components/ui/tiptap/CalloutBoxExtension";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
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

  const insert = (boxStyle: string) => {
    editor.chain().focus().insertCalloutBox({ boxStyle, title: "POINT" }).run();
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
        </div>
      )}
    </div>
  );
}

function MenuBar({ editor }: { editor: Editor }) {
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
    <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5 rounded-t-lg">
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
      <MenuButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive("highlight")}
        title="蛍光マーカー"
      >
        <Highlighter size={s} />
      </MenuButton>

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
    </div>
  );
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "記事の本文を入力してください…",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "rounded-lg max-w-full mx-auto" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
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

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-neutral-300 bg-white overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
