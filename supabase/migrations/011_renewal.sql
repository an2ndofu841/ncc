-- 会員テーブルに更新日カラム追加
ALTER TABLE members ADD COLUMN IF NOT EXISTS renewal_date DATE;

-- 更新案内メール送信履歴テーブル
CREATE TABLE IF NOT EXISTS renewal_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('auto_30d', 'auto_7d', 'auto_1d', 'auto_overdue', 'manual')),
  email_to TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_renewal_reminders_member ON renewal_reminders(member_id);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_sent_at ON renewal_reminders(sent_at);

ALTER TABLE renewal_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage renewal_reminders"
  ON renewal_reminders FOR ALL
  USING (public.is_admin());
