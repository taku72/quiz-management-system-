const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://engmvvqmexokolbsrlnz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZ212dnFtZXhva29sYnNybG56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTUzMTIsImV4cCI6MjA3MjM5MTMxMn0.GBlB1-VViUuacuoHxdhaHGb9J1CUzwmbivmOhnQh_aI'
);

async function checkAndCreateChatTables() {
  try {
    console.log('🔍 Checking chat tables...');

    // Check if chat_rooms table exists
    const { data: rooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select('*')
      .limit(1);

    if (roomsError && roomsError.code === 'PGRST116') {
      console.log('❌ chat_rooms table does not exist. Creating...');

      // Create chat_rooms table
      const { error: createRoomsError } = await supabase.rpc('create_chat_tables');
      if (createRoomsError) {
        console.log('Failed to create tables via RPC. Please create manually in Supabase dashboard.');
        console.log('SQL to run in Supabase SQL Editor:');
        console.log(`
-- Chat integration tables
CREATE TABLE chat_rooms (
   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
   room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
   message TEXT NOT NULL,
   message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'announcement')),
   quiz_context JSONB,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Allow all operations on chat_rooms" ON chat_rooms FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_messages" ON chat_messages FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_chat_rooms_quiz_id ON chat_rooms(quiz_id);
CREATE INDEX idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX idx_chat_rooms_active ON chat_rooms(is_active);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
        `);
      }
    } else if (roomsError) {
      console.log('❌ Error checking chat_rooms:', roomsError.message);
    } else {
      console.log('✅ chat_rooms table exists');
    }

    // Check if chat_messages table exists
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);

    if (messagesError && messagesError.code === 'PGRST116') {
      console.log('❌ chat_messages table does not exist');
    } else if (messagesError) {
      console.log('❌ Error checking chat_messages:', messagesError.message);
    } else {
      console.log('✅ chat_messages table exists');
    }

    // Try to create a test chat room
    console.log('🧪 Testing chat functionality...');
    const { data: testRoom, error: testError } = await supabase
      .from('chat_rooms')
      .insert([{
        name: 'Test Quiz Room',
        description: 'Test room for quiz discussions',
        type: 'quiz',
        created_by: '332f2cb8-74b1-4a97-92b3-3215879042e2' // Use existing user ID
      }])
      .select()
      .single();

    if (testError) {
      console.log('❌ Failed to create test room:', testError.message);
    } else {
      console.log('✅ Successfully created test room:', testRoom.name);

      // Try to send a test message
      const { data: testMessage, error: messageError } = await supabase
        .from('chat_messages')
        .insert([{
          room_id: testRoom.id,
          user_id: '332f2cb8-74b1-4a97-92b3-3215879042e2',
          message: 'Test message - chat is working!',
          message_type: 'text'
        }])
        .select()
        .single();

      if (messageError) {
        console.log('❌ Failed to send test message:', messageError.message);
      } else {
        console.log('✅ Successfully sent test message:', testMessage.message);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAndCreateChatTables();