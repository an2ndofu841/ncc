"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FAQ_ITEMS } from "./faq-data";

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white shadow-sm">
      {FAQ_ITEMS.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-primary-50/80 sm:px-6"
              aria-expanded={open}
            >
              <span className="text-sm font-semibold text-neutral-900 sm:text-base">
                Q. {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-primary transition-transform",
                  open && "rotate-180"
                )}
              />
            </button>
            {open && (
              <div className="border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 sm:px-6">
                <p className="text-sm leading-relaxed text-neutral-600">
                  A. {item.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
