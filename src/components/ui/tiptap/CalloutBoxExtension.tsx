"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewWrapper,
  NodeViewContent,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    calloutBox: {
      insertCalloutBox: (attrs?: {
        boxStyle?: string;
        title?: string;
      }) => ReturnType;
    };
  }
}

export const CalloutBox = Node.create({
  name: "calloutBox",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      boxStyle: { default: "style1" },
      title: { default: "POINT" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-callout-box]",
        getAttrs: (element) => {
          const dom = element as HTMLElement;
          return {
            boxStyle: dom.getAttribute("data-box-style") || "style1",
            title:
              dom.querySelector("[data-callout-title]")?.textContent || "POINT",
          };
        },
        contentElement: "div[data-callout-content]",
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-callout-box": "",
        "data-box-style": node.attrs.boxStyle,
      }),
      ["div", { "data-callout-title": "" }, node.attrs.title],
      ["div", { "data-callout-content": "" }, 0],
    ];
  },

  addCommands() {
    return {
      insertCalloutBox:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { boxStyle: "style1", title: "POINT", ...attrs },
            content: [{ type: "paragraph" }],
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutBoxNodeView);
  },
});

function CalloutBoxNodeView({ node, updateAttributes }: NodeViewProps) {
  const { boxStyle, title } = node.attrs;
  const isStyle1 = boxStyle === "style1";

  return (
    <NodeViewWrapper
      className={`cb-editor cb-editor-${boxStyle}`}
      data-callout-box=""
      data-box-style={boxStyle}
    >
      <div className="cb-editor-header" contentEditable={false}>
        <input
          type="text"
          value={title}
          onChange={(e) => updateAttributes({ title: e.target.value })}
          placeholder="タイトル"
          className="cb-editor-title-input"
        />
        <button
          type="button"
          onClick={() =>
            updateAttributes({ boxStyle: isStyle1 ? "style2" : "style1" })
          }
          className="cb-editor-style-btn"
          title="スタイル切替"
        >
          {isStyle1 ? "▦" : "▤"}
        </button>
      </div>
      <NodeViewContent className="cb-editor-body" />
    </NodeViewWrapper>
  );
}
