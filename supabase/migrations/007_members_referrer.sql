-- 会員テーブルに紹介者名カラムを追加
ALTER TABLE members ADD COLUMN IF NOT EXISTS referrer_name TEXT;
