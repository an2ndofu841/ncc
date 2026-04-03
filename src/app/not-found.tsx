import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  description: "お探しのページは存在しないか、移動した可能性があります。",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-6xl font-bold tabular-nums text-primary sm:text-7xl">
        404
      </p>
      <h1 className="mt-4 text-xl font-bold text-neutral-900 sm:text-2xl">
        ページが見つかりません
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        お探しのページは削除されたか、URLが変更された可能性があります。トップページから再度お探しください。
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        トップページへ戻る
      </Link>
    </div>
  );
}
