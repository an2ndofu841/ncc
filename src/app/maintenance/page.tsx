import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "メンテナンス中 | 全日本カイロプラクティック施術協同組合",
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4 text-center">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-primary-dark sm:text-3xl">
          メンテナンス中です
        </h1>

        <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:text-lg">
          現在、サイトのメンテナンスを行っております。
          <br />
          ご不便をおかけし申し訳ございません。
        </p>

        <div className="mt-8 rounded-xl border border-primary-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-neutral-700">
            メンテナンス中もお急ぎのご連絡は
            <br />
            下記メールアドレスにてお受けしております。
          </p>
          <a
            href="mailto:info@ncc-chiro.or.jp"
            className="mt-3 inline-block text-base font-semibold text-primary hover:underline"
          >
            info@ncc-chiro.or.jp
          </a>
        </div>

        <p className="mt-8 text-xs text-neutral-400">
          全日本カイロプラクティック施術協同組合
        </p>
      </div>
    </div>
  );
}
