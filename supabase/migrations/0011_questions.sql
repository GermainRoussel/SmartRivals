-- Custom questions created via the admin panel.
-- The full Question object is stored as JSONB so any type is supported
-- without schema changes when new question types are added.

CREATE TABLE custom_questions (
  id          TEXT        PRIMARY KEY,
  type        TEXT        NOT NULL,
  theme       TEXT        NOT NULL,
  difficulty  TEXT        NOT NULL,
  data        JSONB       NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX custom_questions_type_idx ON custom_questions (type);

ALTER TABLE custom_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can read (questions are served to all players).
CREATE POLICY "custom_questions_public_read" ON custom_questions
  FOR SELECT USING (true);

-- Only authenticated users can write (admin check done in the server action).
CREATE POLICY "custom_questions_auth_write" ON custom_questions
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
