import { Node, mergeAttributes } from "@tiptap/core";

const PHOTO_URL = typeof window !== "undefined"
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/kitagawafusao1.png`
  : "";

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
    return () => {
      const dom = document.createElement("div");
      dom.classList.add("sv-editor-wrap");
      dom.setAttribute("data-supervisor-comment", "");

      const left = document.createElement("div");
      left.classList.add("sv-editor-left");
      left.contentEditable = "false";

      const photo = document.createElement("img");
      photo.src = PHOTO_URL;
      photo.alt = "北川房雄";
      photo.classList.add("sv-editor-photo");

      const name = document.createElement("span");
      name.classList.add("sv-editor-name");
      name.textContent = "北川房雄";

      left.appendChild(photo);
      left.appendChild(name);

      const bubble = document.createElement("div");
      bubble.classList.add("sv-editor-bubble");

      const arrow = document.createElement("div");
      arrow.classList.add("sv-editor-bubble-arrow");

      const contentDOM = document.createElement("div");
      contentDOM.classList.add("sv-editor-bubble-content");

      bubble.appendChild(arrow);
      bubble.appendChild(contentDOM);

      dom.appendChild(left);
      dom.appendChild(bubble);

      return {
        dom,
        contentDOM,
        update(updatedNode) {
          return updatedNode.type.name === "supervisorComment";
        },
        ignoreMutation(mutation) {
          return !contentDOM.contains(mutation.target);
        },
      };
    };
  },
});
