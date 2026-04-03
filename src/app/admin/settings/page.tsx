import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader
        title="設定"
        description="管理アカウントと権限に関する情報です。"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "設定" },
        ]}
      />
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900">
            管理アカウント
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            パスワードの変更やメールアドレスの更新は、ログイン後のマイページまたは
            Supabase の認証設定から行ってください。将来的にここからプロフィール編集を
            提供する予定です。
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-neutral-900">
            権限ロールの説明
          </h2>
          <ul className="mt-4 space-y-4 text-sm text-neutral-700">
            <li>
              <strong className="text-neutral-900">システム管理者</strong>
              <p className="mt-1 text-neutral-600">
                会員・申込み・セミナー・書類・お問い合わせ・お知らせ・固定ページなど、
                すべての管理機能にアクセスできます。認証ユーザーの作成を含む承認処理も
                実行できます。
              </p>
            </li>
            <li>
              <strong className="text-neutral-900">事務局</strong>
              <p className="mt-1 text-neutral-600">
                システム管理者と同様に、運用上のほとんどのデータを管理できます。
                日常の入会対応や資料公開、お問い合わせ対応を想定したロールです。
              </p>
            </li>
            <li>
              <strong className="text-neutral-900">編集者</strong>
              <p className="mt-1 text-neutral-600">
                お知らせおよび固定ページの作成・編集が中心です。会員情報や申込みの
                承認など、機密性の高い操作はデータベースの権限により制限される場合があります。
              </p>
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}
