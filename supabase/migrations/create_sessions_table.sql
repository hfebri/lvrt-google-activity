-- Create sessions table for multiplayer game sessions
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

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read sessions
CREATE POLICY "Anyone can read sessions" ON sessions
  FOR SELECT USING (true);

-- Create policy to allow anyone to insert sessions
CREATE POLICY "Anyone can create sessions" ON sessions
  FOR INSERT WITH CHECK (true);

-- Create policy to allow anyone to update sessions
CREATE POLICY "Anyone can update sessions" ON sessions
  FOR UPDATE USING (true);
