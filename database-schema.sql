-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (with password column)
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'student')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  time_limit INTEGER NOT NULL, -- in minutes
  passing_score INTEGER NOT NULL, -- percentage
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_attempts table
CREATE TABLE quiz_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL, -- percentage
  time_taken INTEGER NOT NULL, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  passed BOOLEAN NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_quizzes_active ON quizzes(is_active);
CREATE INDEX idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies (allow all operations for authenticated users)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on quizzes" ON quizzes FOR ALL USING (true);
CREATE POLICY "Allow all operations on quiz_attempts" ON quiz_attempts FOR ALL USING (true);

-- Insert sample admin user with password
INSERT INTO users (id, username, email, password, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin', 'admin@quiz.com', 'admin123', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'student1', 'student1@quiz.com', 'student123', 'student');

-- Insert sample quizzes with points field in questions
INSERT INTO quizzes (id, title, description, questions, time_limit, passing_score, created_by) VALUES 
  (
    '10000000-0000-0000-0000-000000000001',
    'JavaScript Basics',
    'Test your knowledge of JavaScript fundamentals',
    '[
      {
        "id": "1",
        "type": "multiple-choice",
        "question": "What is the correct way to declare a variable in JavaScript?",
        "options": ["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"],
        "correctAnswer": 0,
        "points": 10
      },
      {
        "id": "2",
        "type": "true-false",
        "question": "JavaScript is a compiled language.",
        "correctAnswer": false,
        "points": 10
      }
    ]'::jsonb,
    30,
    70,
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'React Fundamentals',
    'Basic concepts of React development',
    '[
      {
        "id": "1",
        "type": "multiple-choice",
        "question": "What is JSX?",
        "options": ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"],
        "correctAnswer": 0,
        "points": 15
      },
      {
        "id": "2",
        "type": "true-false",
        "question": "React components must return a single element.",
        "correctAnswer": true,
        "points": 15
      }
    ]'::jsonb,
    25,
    75,
    '00000000-0000-0000-0000-000000000001'
  );
