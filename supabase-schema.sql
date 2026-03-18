-- ============================================
-- FinanceFlow - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX idx_transactions_type ON public.transactions(type);

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  currency VARCHAR(10) DEFAULT 'USD',
  monthly_budget DECIMAL(12, 2),
  savings_goal DECIMAL(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- OPTIONAL: Seed sample data (for testing)
-- Replace 'YOUR_USER_ID' with your actual auth.users id
-- ============================================

/*
INSERT INTO public.transactions (user_id, amount, type, category, description, date) VALUES
  ('YOUR_USER_ID', 3500.00, 'income', 'salary', 'Monthly salary', CURRENT_DATE - INTERVAL '30 days'),
  ('YOUR_USER_ID', 450.00, 'expense', 'rent', 'Monthly rent', CURRENT_DATE - INTERVAL '28 days'),
  ('YOUR_USER_ID', 85.50, 'expense', 'food', 'Grocery shopping', CURRENT_DATE - INTERVAL '25 days'),
  ('YOUR_USER_ID', 45.00, 'expense', 'transport', 'Monthly bus pass', CURRENT_DATE - INTERVAL '20 days'),
  ('YOUR_USER_ID', 120.00, 'expense', 'utilities', 'Electric bill', CURRENT_DATE - INTERVAL '15 days'),
  ('YOUR_USER_ID', 500.00, 'income', 'freelance', 'Web design project', CURRENT_DATE - INTERVAL '10 days'),
  ('YOUR_USER_ID', 65.00, 'expense', 'entertainment', 'Netflix + Spotify', CURRENT_DATE - INTERVAL '5 days'),
  ('YOUR_USER_ID', 200.00, 'expense', 'shopping', 'Clothes', CURRENT_DATE - INTERVAL '3 days');
*/

-- ============================================
-- UPDATE: Add goals_json column to user_profiles
-- Run this if you already created the table above
-- ============================================
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS goals_json TEXT DEFAULT '[]';

-- Update the upsert policy to allow goals_json updates
-- (RLS policies already cover this via the existing update policy)
