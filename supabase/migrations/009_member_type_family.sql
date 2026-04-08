-- member_type CHECK制約を更新: family を追加、obsolete な supporting/honorary を維持（既存データ保護）
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_member_type_check;
ALTER TABLE members ADD CONSTRAINT members_member_type_check
  CHECK (member_type IN ('regular','associate','student','family','supporting','honorary'));
