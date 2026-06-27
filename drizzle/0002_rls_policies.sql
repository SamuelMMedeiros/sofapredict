-- RLS (Row Level Security) Policies for Supabase
-- Enable RLS on all tables

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bets_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_consent_log ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = openId);

-- User profiles policies
-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (userId = (SELECT id FROM users WHERE openId = auth.uid()::text));

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (userId = (SELECT id FROM users WHERE openId = auth.uid()::text));

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (userId = (SELECT id FROM users WHERE openId = auth.uid()::text));

-- User bets history policies
-- Users can only see and manage their own bets
CREATE POLICY "Users can view own bets"
  ON user_bets_history FOR SELECT
  USING (userId = (SELECT id FROM users WHERE openId = auth.uid()::text));

CREATE POLICY "Users can create own bets"
  ON user_bets_history FOR INSERT
  WITH CHECK (userId = (SELECT id FROM users WHERE openId = auth.uid()::text));

CREATE POLICY "Users can update own bets"
  ON user_bets_history FOR UPDATE
  USING (userId = (SELECT id FROM users WHERE openId = auth.uid()::text));

-- User stats policies
-- Users can only see their own stats
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (userId = (SELECT id FROM users WHERE openId = auth.uid()::text));

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (userId = (SELECT id FROM users WHERE openId = auth.uid()::text));

-- API cache is public (no user-specific data)
CREATE POLICY "API cache is readable by all"
  ON api_cache FOR SELECT
  USING (true);

-- LGPD consent log - users can view their own consent records
CREATE POLICY "Users can view own consent records"
  ON lgpd_consent_log FOR SELECT
  USING (userId = (SELECT id FROM users WHERE openId = auth.uid()::text));

CREATE POLICY "Users can create own consent records"
  ON lgpd_consent_log FOR INSERT
  WITH CHECK (userId = (SELECT id FROM users WHERE openId = auth.uid()::text));

-- Create encryption function for sensitive data
CREATE OR REPLACE FUNCTION encrypt_api_key(key text)
RETURNS text AS $$
BEGIN
  -- In production, use pgcrypto extension
  -- For now, return the key (implement proper encryption in your app)
  RETURN key;
END;
$$ LANGUAGE plpgsql;

-- Create index for better query performance
CREATE INDEX idx_user_profiles_userId ON user_profiles(userId);
CREATE INDEX idx_user_bets_userId ON user_bets_history(userId);
CREATE INDEX idx_user_stats_userId ON user_stats(userId);
CREATE INDEX idx_api_cache_key ON api_cache(cacheKey);
CREATE INDEX idx_api_cache_expiry ON api_cache(expiresAt);
CREATE INDEX idx_lgpd_consent_userId ON lgpd_consent_log(userId);
