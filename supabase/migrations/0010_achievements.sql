-- Persistent achievement unlocks (one row per user per achievement).
-- Achievements are still defined in code (lib/achievements.ts); this table
-- stores when each was first unlocked so the date survives re-renders.

CREATE TABLE user_achievements (
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT     NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Anyone can read achievements (for public profiles in the future).
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_public_read" ON user_achievements
  FOR SELECT USING (true);

CREATE POLICY "achievements_own_insert" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for fast per-user lookups.
CREATE INDEX user_achievements_user_idx ON user_achievements (user_id, unlocked_at DESC);
