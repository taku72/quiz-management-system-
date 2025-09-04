const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://engmvvqmexokolbsrlnz.supabase.co';
const supabaseKey = 'sb_publishable_cSH24jDset0tmHEk6kbNNQ_GuPerXU8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test users table first
    console.log('Testing users table...');
    const { data: userData, error: userError } = await supabase.from('users').select('*').limit(1);
    
    if (userError) {
      console.error('Users table error:', userError);
    } else {
      console.log('Users table working:', userData);
    }
  
    // Test creating a new user to see what gets saved
  console.log('Testing user creation...');
  const testUser = {
    username: 'testuser' + Date.now(),
    email: 'test' + Date.now() + '@example.com',
    role: 'student',
    password: 'testpass123'
  };
  
  const { data: newUser, error: userCreationError } = await supabase
    .from('users')
    .insert([testUser])
    .select()
    .single();
  
  if (userCreationError) {
    console.log('User creation error:', userCreationError);
  } else {
    console.log('User created successfully:', newUser);
  }
  
  // Test quizzes table structure
    console.log('Testing quizzes table...');
    const { data: quizStructure, error: structureError } = await supabase.from('quizzes').select('*').limit(1);
    
    if (structureError) {
      console.error('Quizzes table structure error:', structureError);
      return;
    }
    
    console.log('Quizzes table structure:', quizStructure);
    
    // Test quiz creation with minimal data
    console.log('Testing quiz creation...');
    const testQuiz = {
      title: 'Test Quiz ' + Date.now(),
      description: 'Testing database connection',
      questions: JSON.stringify([
        {
          id: '1',
          type: 'multiple-choice',
          question: 'Test question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          points: 10
        }
      ]),
      time_limit: 10,
      passing_score: 60,
      created_by: '332f2cb8-74b1-4a97-92b3-3215879042e2',
      is_active: true
    };
    
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert([testQuiz])
      .select()
      .single();
    
    if (quizError) {
      console.error('Quiz creation error:', quizError);
      console.error('Error details:', JSON.stringify(quizError, null, 2));
    } else {
      console.log('Quiz created successfully:', quizData);
    }
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testConnection();
