"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewWrapper,
  NodeViewContent,
  ReactNodeViewRenderer,
} from "@tiptap/react";

const PHOTO_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/kitagawafusao1.png`;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    supervisorComment: {
      insertSupervisorComment: () => ReturnType;
    };
  }
}

export const SupervisorComment = Node.create({
  name: "supervisorComment",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  parseHTML() {
    return [
      {
        tag: "div[data-supervisor-comment]",
        contentElement: "div[data-supervisor-body]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-supervisor-comment": "" }),
      [
        "div",
        { "data-supervisor-meta": "" },
        [
          "img",
          {
            src: PHOTO_URL,
            alt: "北川房雄",
            "data-supervisor-photo": "",
          },
        ],
        ["span", { "data-supervisor-name": "" }, "北川房雄"],
      ],
      ["div", { "data-supervisor-body": "" }, 0],
    ];
  },

  addCommands() {
    return {
      insertSupervisorComment:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [{ type: "paragraph" }],
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(SupervisorCommentNodeView);
  },
});

function SupervisorCommentNodeView() {
  return (
    <NodeViewWrapper className="sv-comment-editor">
      <div className="sv-comment-avatar" contentEditable={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PHOTO_URL} alt="北川房雄" />
        <span className="sv-comment-name">北川房雄</span>
      </div>
      <div className="sv-comment-bubble">
        <NodeViewContent className="sv-comment-content" />
      </div>
    </NodeViewWrapper>
  );
}
