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

-- Chat integration indexes
CREATE INDEX idx_chat_rooms_quiz_id ON chat_rooms(quiz_id);
CREATE INDEX idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX idx_chat_rooms_active ON chat_rooms(is_active);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_study_groups_quiz_id ON study_groups(quiz_id);
CREATE INDEX idx_study_groups_active ON study_groups(is_active);
CREATE INDEX idx_user_study_groups_user_id ON user_study_groups(user_id);
CREATE INDEX idx_user_study_groups_group_id ON user_study_groups(group_id);

-- Chat integration tables
CREATE TABLE chat_rooms (
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   description TEXT,
   type VARCHAR(50) CHECK (type IN ('quiz', 'study', 'general')) NOT NULL,
   quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
   created_by UUID REFERENCES users(id) ON DELETE SET NULL,
   is_active BOOLEAN DEFAULT true,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_messages (
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
   message TEXT NOT NULL,
   message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'announcement')),
   quiz_context JSONB, -- Store quiz-related context like question references
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE study_groups (
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   description TEXT,
   quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
   created_by UUID REFERENCES users(id) ON DELETE CASCADE,
   max_members INTEGER DEFAULT 10,
   is_active BOOLEAN DEFAULT true,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_study_groups (
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
   group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
   role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
   joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   UNIQUE(user_id, group_id)
);

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

CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_study_groups ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies (allow all operations for authenticated users)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on quizzes" ON quizzes FOR ALL USING (true);
CREATE POLICY "Allow all operations on quiz_attempts" ON quiz_attempts FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_rooms" ON chat_rooms FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_messages" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on study_groups" ON study_groups FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_study_groups" ON user_study_groups FOR ALL USING (true);

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
