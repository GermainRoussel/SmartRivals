-- Deduplicate existing usernames (append _2, _3, … to later duplicates)
-- so the unique index can be created cleanly.
DO $$
DECLARE
  dup_username TEXT;
  dup_id UUID;
  n INT;
  candidate TEXT;
BEGIN
  FOR dup_username IN
    SELECT username FROM profiles GROUP BY username HAVING COUNT(*) > 1
  LOOP
    n := 2;
    FOR dup_id IN
      SELECT id FROM profiles WHERE username = dup_username ORDER BY created_at ASC OFFSET 1
    LOOP
      LOOP
        candidate := dup_username || '_' || n;
        EXIT WHEN NOT EXISTS (
          SELECT 1 FROM profiles WHERE lower(username) = lower(candidate)
        );
        n := n + 1;
      END LOOP;
      UPDATE profiles SET username = candidate WHERE id = dup_id;
      n := n + 1;
    END LOOP;
  END LOOP;
END;
$$;

-- Case-insensitive unique constraint on usernames
CREATE UNIQUE INDEX profiles_username_lower_key ON profiles (lower(username));
