CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  waterfall_id INTEGER NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'pass')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_votes_waterfall_id ON votes(waterfall_id);
CREATE INDEX IF NOT EXISTS idx_votes_vote_type ON votes(vote_type);
