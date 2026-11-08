-- DIWALIverse Database Schema & Row-Level Security
-- Execute in Supabase SQL Editor

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT NOT NULL DEFAULT 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdj1BnJOeIpu27ZMjRTJHTNqx8S-X8TrpcufbFpCPEiQ8yfPCGa2H8ujHRsHV0879F6XctnS1u84B_QkUlc1zKUHQekmr2a7U-ijp3ngl2Rgqo4E3zPj7gtVByeEE-lENcIL5i8UQ-1gYwOFWx2qKBi0suT8BpvQlbc0Mko8WNIoa_iG2IW_iXeZSVVPVbWIOJ6sUE-L5j4vga7oI_PUYfszekHIRlvrO3ymjkUoY',
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  coins INT NOT NULL DEFAULT 1000,
  selected_skin TEXT NOT NULL DEFAULT 'skin_saffron_comet',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Friendships Table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, friend_id)
);

-- 3. Match History Table
CREATE TABLE IF NOT EXISTS public.match_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL,
  game_id TEXT NOT NULL,
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Match Players Table
CREATE TABLE IF NOT EXISTS public.match_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.match_history(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rank INT NOT NULL DEFAULT 1,
  score INT NOT NULL DEFAULT 0,
  coins_earned INT NOT NULL DEFAULT 0,
  xp_earned INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Leaderboard Entries Table
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'all_time')),
  score INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(player_id, game_id, period)
);

-- 6. Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  coin_reward INT NOT NULL DEFAULT 0,
  xp_reward INT NOT NULL DEFAULT 0
);

-- 7. Player Inventory Table
CREATE TABLE IF NOT EXISTS public.player_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(player_id, item_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_match_history_game_id ON public.match_history(game_id);
CREATE INDEX IF NOT EXISTS idx_match_players_match_id ON public.match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_player_id ON public.match_players(player_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_period_score ON public.leaderboard_entries(game_id, period, score DESC);
CREATE INDEX IF NOT EXISTS idx_player_inventory_player ON public.player_inventory(player_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Friendships policies
CREATE POLICY "Users can view their friendships."
  ON public.friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert friendships."
  ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their friendships."
  ON public.friendships FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Match history policies (Read-only for public, inserts by authenticated)
CREATE POLICY "Matches viewable by everyone"
  ON public.match_history FOR SELECT USING (true);

CREATE POLICY "Authenticated users can record match results"
  ON public.match_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Match players policies
CREATE POLICY "Match players viewable by everyone"
  ON public.match_players FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert match players"
  ON public.match_players FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Leaderboard policies
CREATE POLICY "Leaderboards are viewable by everyone"
  ON public.leaderboard_entries FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update their leaderboard entries"
  ON public.leaderboard_entries FOR ALL USING (auth.uid() = player_id);

-- Achievements policies
CREATE POLICY "Achievements viewable by everyone"
  ON public.achievements FOR SELECT USING (true);

-- Inventory policies
CREATE POLICY "Users can view their own inventory"
  ON public.player_inventory FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Users can insert into their own inventory"
  ON public.player_inventory FOR INSERT WITH CHECK (auth.uid() = player_id);

