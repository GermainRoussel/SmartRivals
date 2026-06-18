-- Per-question active/inactive override managed via the admin panel.
-- Only disabled questions appear here (active = false).
-- Questions absent from this table are considered active.

CREATE TABLE question_overrides (
  question_id TEXT    PRIMARY KEY,
  active      BOOLEAN NOT NULL DEFAULT true,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE question_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "overrides_public_read" ON question_overrides
  FOR SELECT USING (true);

CREATE POLICY "overrides_auth_write" ON question_overrides
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
