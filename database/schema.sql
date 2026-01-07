-- JARVIS Voice Assistant v3 - PostgreSQL Schema
-- Created: 2026-01-07

-- Conversations table
CREATE TABLE IF NOT EXISTS jarvis_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL UNIQUE,
  user_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS jarvis_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id UUID REFERENCES jarvis_conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metrics table for tracking usage
CREATE TABLE IF NOT EXISTS jarvis_metrics (
  id BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  execution_id VARCHAR(255),
  used_router BOOLEAN DEFAULT FALSE,
  model_used VARCHAR(100),
  prompt_length INT,
  response_length INT,
  latency_ms INT,
  cost_tokens INT DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_session ON jarvis_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON jarvis_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON jarvis_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON jarvis_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_session ON jarvis_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON jarvis_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_model ON jarvis_metrics(model_used);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON jarvis_conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON jarvis_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Useful views

-- View: Recent conversations with message count
CREATE OR REPLACE VIEW v_recent_conversations AS
SELECT 
  c.id,
  c.session_id,
  c.created_at,
  c.updated_at,
  COUNT(m.id) as message_count,
  MAX(m.timestamp) as last_message_at
FROM jarvis_conversations c
LEFT JOIN jarvis_messages m ON c.id = m.conversation_id
GROUP BY c.id
ORDER BY c.updated_at DESC;

-- View: Model usage statistics
CREATE OR REPLACE VIEW v_model_usage AS
SELECT 
  model_used,
  COUNT(*) as total_requests,
  AVG(latency_ms) as avg_latency_ms,
  SUM(cost_tokens) as total_tokens,
  COUNT(CASE WHEN used_router THEN 1 END) as router_calls
FROM jarvis_metrics
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY model_used
ORDER BY total_requests DESC;

-- View: Daily usage stats
CREATE OR REPLACE VIEW v_daily_stats AS
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_queries,
  SUM(CASE WHEN used_router THEN 1 ELSE 0 END) as router_calls,
  AVG(latency_ms) as avg_latency_ms,
  SUM(cost_tokens) as total_tokens
FROM jarvis_metrics
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO jarvis_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO jarvis_user;
