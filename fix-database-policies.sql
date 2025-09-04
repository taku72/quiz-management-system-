-- Fix infinite recursion in database policies
-- Run this in your Supabase SQL Editor

-- Drop existing policies that are causing recursion
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication users only" ON users;

-- Drop existing policies on quizzes
DROP POLICY IF EXISTS "Enable read access for all users" ON quizzes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON quizzes;
DROP POLICY IF EXISTS "Enable update for quiz creators" ON quizzes;
DROP POLICY IF EXISTS "Enable delete for quiz creators" ON quizzes;

-- Drop existing policies on quiz_attempts
DROP POLICY IF EXISTS "Users can view own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can insert own attempts" ON quiz_attempts;

-- Disable RLS temporarily to fix the issue
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts DISABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Simple policies without recursion
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on quizzes" ON quizzes FOR ALL USING (true);
CREATE POLICY "Allow all operations on quiz_attempts" ON quiz_attempts FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON quizzes TO anon, authenticated;
GRANT ALL ON quiz_attempts TO anon, authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
