-- 申込テーブルに紹介者名カラムを追加
ALTER TABLE applications ADD COLUMN IF NOT EXISTS referrer_name TEXT;
