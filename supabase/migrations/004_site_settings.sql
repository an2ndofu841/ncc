-- site_settings: サイト全体の設定を管理するKVテーブル
CREATE TABLE IF NOT EXISTS public.site_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'null'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 初期値: メンテナンスモード OFF
INSERT INTO public.site_settings (key, value)
VALUES ('maintenance_mode', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- プレビューキー（メンテナンス中に関係者がサイトを確認するための秘密鍵）
INSERT INTO public.site_settings (key, value)
VALUES ('preview_key', '"ncc-preview-2026"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 誰でも読める（ミドルウェア等で参照するため）
CREATE POLICY "site_settings_select" ON public.site_settings
  FOR SELECT USING (true);

-- 管理者のみ更新可
CREATE POLICY "site_settings_update" ON public.site_settings
  FOR UPDATE USING (public.is_admin());
