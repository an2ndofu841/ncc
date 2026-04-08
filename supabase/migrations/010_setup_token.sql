-- パスワード初期設定用のワンタイムトークン
ALTER TABLE members ADD COLUMN IF NOT EXISTS setup_token TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS setup_token_expires TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_members_setup_token ON members(setup_token) WHERE setup_token IS NOT NULL;
