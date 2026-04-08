import Link from "next/link";

const MHLW_URL = "https://www.mhlw.go.jp/index.html";

export default function Footer() {
  const koseishoSrc = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/koseisho.png`
    : "";
  return (
    <footer className="mt-auto bg-neutral-900 text-neutral-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
                全
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">
                  全日本カイロプラクティック
                </p>
                <p className="text-xs text-neutral-400 leading-tight">
                  施術協同組合
                </p>
              </div>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              カイロプラクティック施術者の
              <br />
              地位向上と業界発展のために
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">
              組合について
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  組合概要
                </Link>
              </li>
              <li>
                <Link
                  href="/greeting"
                  className="hover:text-white transition-colors"
                >
                  会長あいさつ
                </Link>
              </li>
              <li>
                <Link
                  href="/activities"
                  className="hover:text-white transition-colors"
                >
                  活動内容
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-white transition-colors"
                >
                  お知らせ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">
              入会案内
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/membership"
                  className="hover:text-white transition-colors"
                >
                  入会のご案内
                </Link>
              </li>
              <li>
                <Link
                  href="/membership-types"
                  className="hover:text-white transition-colors"
                >
                  会員種別・会費
                </Link>
              </li>
              <li>
                <Link
                  href="/apply"
                  className="hover:text-white transition-colors"
                >
                  入会申込み
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-white transition-colors"
                >
                  よくある質問
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">
              サポート
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="hover:text-white transition-colors"
                >
                  加盟院検索
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="hover:text-white transition-colors"
                >
                  会員ログイン
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 space-y-8 border-t border-neutral-700 pt-8">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-neutral-400 sm:justify-start">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              利用規約
            </Link>
            <Link
              href="/tokushoho"
              className="hover:text-white transition-colors"
            >
              特定商取引法に基づく表記
            </Link>
          </div>

          {koseishoSrc ? (
            <div className="flex justify-center sm:justify-start">
              <a
                href={MHLW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white/95 p-3 shadow-sm outline-none ring-offset-2 ring-offset-neutral-900 transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="厚生労働省の公式サイトを別タブで開く"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={koseishoSrc}
                  alt="厚生労働省"
                  className="h-11 w-auto max-w-[min(100%,220px)] object-contain object-left"
                />
              </a>
            </div>
          ) : null}

          <p className="text-center text-xs text-neutral-500 sm:text-left">
            &copy; {new Date().getFullYear()} 全日本カイロプラクティック施術協同組合. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
