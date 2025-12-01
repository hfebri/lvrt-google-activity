-- Initial schema for Google Activity Game
-- This migration creates all necessary tables for the application

-- =====================================================
-- SCORES TABLE (for Activity 3 leaderboard)
-- =====================================================
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on score for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);

-- Enable Row Level Security
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Policies for scores table
CREATE POLICY "Anyone can read scores" ON scores
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert scores" ON scores
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- SESSIONS TABLE (for multiplayer sessions)
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code VARCHAR(6) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  host_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Create index on session_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_code ON sessions(session_code);

-- Create index on status for filtering active sessions
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policies for sessions table
CREATE POLICY "Anyone can read sessions" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create sessions" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update sessions" ON sessions
  FOR UPDATE USING (true);

-- =====================================================
-- ACTIVITY COMPLETIONS (optional - for tracking user progress)
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  activity_number INTEGER NOT NULL CHECK (activity_number IN (1, 2, 3)),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user activity lookups
CREATE INDEX IF NOT EXISTS idx_activity_completions_user ON activity_completions(user_id);

-- Enable Row Level Security
ALTER TABLE activity_completions ENABLE ROW LEVEL SECURITY;

-- Policies for activity_completions
CREATE POLICY "Anyone can read completions" ON activity_completions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert completions" ON activity_completions
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- MULTIPLAYER GAME STATS (optional - for game history)
-- =====================================================
CREATE TABLE IF NOT EXISTS multiplayer_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code VARCHAR(6) REFERENCES sessions(session_code),
  player_id TEXT NOT NULL,
  player_name TEXT,
  final_score INTEGER NOT NULL,
  items_collected JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_session ON multiplayer_games(session_code);
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_player ON multiplayer_games(player_id);

-- Enable Row Level Security
ALTER TABLE multiplayer_games ENABLE ROW LEVEL SECURITY;

-- Policies for multiplayer_games
CREATE POLICY "Anyone can read game stats" ON multiplayer_games
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert game stats" ON multiplayer_games
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- FUNCTIONS (optional - for cleanup)
-- =====================================================

-- Function to clean up old sessions (optional, can be run manually or via cron)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions
  WHERE created_at < NOW() - INTERVAL '24 hours'
  AND status = 'finished';
END;
$$ LANGUAGE plpgsql;

-- Function to get top scores
CREATE OR REPLACE FUNCTION get_top_scores(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.score, s.created_at
  FROM scores s
  ORDER BY s.score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
