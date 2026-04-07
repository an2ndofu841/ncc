import { Node, mergeAttributes } from "@tiptap/core";

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
    return ({ node, getPos, editor }) => {
      const boxStyle = node.attrs.boxStyle || "style1";

      const dom = document.createElement("div");
      dom.classList.add("cb-editor", `cb-editor-${boxStyle}`);
      dom.setAttribute("data-callout-box", "");
      dom.setAttribute("data-box-style", boxStyle);

      const header = document.createElement("div");
      header.classList.add("cb-editor-header");
      header.contentEditable = "false";

      const titleInput = document.createElement("input");
      titleInput.type = "text";
      titleInput.value = node.attrs.title || "POINT";
      titleInput.placeholder = "タイトル";
      titleInput.classList.add("cb-editor-title-input");
      titleInput.addEventListener("input", () => {
        const pos = getPos();
        if (typeof pos === "number") {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              title: titleInput.value,
            })
          );
        }
      });

      const styleBtn = document.createElement("button");
      styleBtn.type = "button";
      styleBtn.classList.add("cb-editor-style-btn");
      styleBtn.title = "スタイル切替";
      styleBtn.textContent = boxStyle === "style1" ? "▦" : "▤";
      styleBtn.addEventListener("click", () => {
        const pos = getPos();
        if (typeof pos === "number") {
          const newStyle =
            node.attrs.boxStyle === "style1" ? "style2" : "style1";
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              boxStyle: newStyle,
            })
          );
        }
      });

      header.appendChild(titleInput);
      header.appendChild(styleBtn);

      const contentDOM = document.createElement("div");
      contentDOM.classList.add("cb-editor-body");

      dom.appendChild(header);
      dom.appendChild(contentDOM);

      return {
        dom,
        contentDOM,
        update(updatedNode) {
          if (updatedNode.type.name !== "calloutBox") return false;
          const newStyle = updatedNode.attrs.boxStyle || "style1";
          dom.className = `cb-editor cb-editor-${newStyle}`;
          dom.setAttribute("data-box-style", newStyle);
          titleInput.value = updatedNode.attrs.title || "";
          styleBtn.textContent = newStyle === "style1" ? "▦" : "▤";
          return true;
        },
        stopEvent(event) {
          const target = event.target as HTMLElement;
          return (
            target === titleInput ||
            target === styleBtn ||
            titleInput.contains(target) ||
            styleBtn.contains(target)
          );
        },
        ignoreMutation(mutation) {
          return !contentDOM.contains(mutation.target);
        },
      };
    };
  },
});
