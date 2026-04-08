-- Stripe決済関連カラムを追加
ALTER TABLE members ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
