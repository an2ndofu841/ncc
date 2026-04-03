# 全日本カイロプラクティック施術協同組合 公式サイト

Next.js (App Router) + Supabase + Tailwind CSS で構築された組合公式サイトです。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **データベース / 認証 / ストレージ**: Supabase
- **スタイリング**: Tailwind CSS v4
- **フォーム**: react-hook-form + zod
- **アイコン**: lucide-react
- **デプロイ**: Vercel

## プロジェクト構成

```
src/
├── app/
│   ├── (site)/          # 公開ページ（Header/Footer 付き）
│   │   ├── page.tsx     # トップページ
│   │   ├── about/       # 組合概要
│   │   ├── greeting/    # 理事長あいさつ
│   │   ├── activities/  # 活動内容
│   │   ├── membership/  # 入会案内
│   │   ├── membership-types/  # 会員種別・会費
│   │   ├── faq/         # よくある質問
│   │   ├── news/        # お知らせ一覧・詳細
│   │   ├── search/      # 加盟院検索
│   │   ├── contact/     # お問い合わせ
│   │   ├── apply/       # 入会申込みフォーム
│   │   ├── auth/        # 認証（ログイン・パスワード再設定）
│   │   ├── privacy/     # プライバシーポリシー
│   │   └── terms/       # 利用規約
│   ├── member/          # 会員専用エリア
│   │   ├── page.tsx     # マイページ
│   │   ├── profile/     # 会員情報
│   │   ├── news/        # 会員向けお知らせ
│   │   ├── documents/   # 書類ダウンロード
│   │   └── seminars/    # 研修・セミナー
│   ├── admin/           # 管理画面
│   │   ├── page.tsx     # ダッシュボード
│   │   ├── news/        # お知らせ管理
│   │   ├── members/     # 会員管理
│   │   ├── applications/# 申込み管理
│   │   ├── seminars/    # セミナー管理
│   │   ├── documents/   # 書類管理
│   │   ├── contacts/    # お問い合わせ管理
│   │   ├── pages/       # 固定ページ管理
│   │   └── settings/    # 設定
│   └── api/             # APIルート
├── components/
│   ├── layout/          # Header, Footer, Sidebar
│   ├── member/          # 会員専用コンポーネント
│   └── ui/              # 汎用UIコンポーネント
├── lib/
│   ├── supabase/        # Supabase クライアント設定
│   ├── types.ts         # TypeScript 型定義
│   ├── utils.ts         # ユーティリティ関数
│   └── email.ts         # メール送信
└── middleware.ts         # 認証ミドルウェア

supabase/
└── migrations/          # データベースマイグレーション
```

## セットアップ手順

### 1. Supabase プロジェクト作成

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. SQL Editor で `supabase/migrations/001_initial.sql` を実行
3. SQL Editor で `supabase/migrations/002_seminar_registration_participants.sql` を実行

### 2. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して Supabase の接続情報を設定:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Supabase 認証設定

Supabase ダッシュボード > Authentication > URL Configuration:
- Site URL: `http://localhost:3000`（本番は Vercel URL）
- Redirect URLs: `http://localhost:3000/auth/callback`

### 4. Storage バケット設定

マイグレーションで自動作成されますが、手動設定が必要な場合:
- `uploads`: 公開バケット（申込み添付ファイル用）
- `documents`: 非公開バケット（会員向け書類用）

### 5. ローカル開発

```bash
npm install
npm run dev
```

### 6. 初期管理者の作成

1. Supabase ダッシュボード > Authentication > Users で管理者ユーザーを作成
2. `members` テーブルに対応するレコードを作成（`role` を `system_admin` に設定）

```sql
INSERT INTO members (auth_id, member_number, name, name_kana, email, phone, role, status)
VALUES (
  'auth_user_id_here',
  'M00001',
  '管理者名',
  'カンリシャメイ',
  'admin@example.com',
  '03-0000-0000',
  'system_admin',
  'active'
);
```

## Vercel デプロイ

1. GitHub リポジトリに push
2. [Vercel](https://vercel.com) でプロジェクトをインポート
3. 環境変数を設定（`.env.local` の内容）
4. Supabase の Site URL と Redirect URLs を本番ドメインに更新

## メール通知

メール通知は `src/lib/email.ts` で管理されています。

- **開発環境**: コンソールにログ出力
- **本番環境**: `RESEND_API_KEY` を設定すると [Resend](https://resend.com) 経由で送信

追加の環境変数:
```
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@your-domain.com
ADMIN_EMAIL=admin@your-domain.com
```

## 主要機能

| 機能 | 説明 |
|------|------|
| 公開サイト | 組合概要、活動内容、入会案内、FAQ、お知らせ |
| 加盟院検索 | 都道府県・キーワードで検索可能 |
| 入会申込み | Web フォーム + ファイル添付、管理者通知 |
| 会員認証 | メール/パスワード認証、パスワード再設定 |
| 会員ポータル | マイページ、お知らせ、書類DL、セミナー申込み |
| 管理画面 | お知らせ/会員/申込み/セミナー/書類/お問い合わせ管理 |
| メール通知 | 申込み確認、お問い合わせ受付、承認通知 等 |
| 権限管理 | system_admin / office_staff / editor / member |

## ライセンス

Private
