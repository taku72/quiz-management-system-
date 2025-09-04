import { supabase } from './supabase';
import { User, Quiz, QuizAttempt, Question } from '@/types';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && url !== 'https://placeholder.supabase.co' && key && key !== 'your-anon-key';
};

// User operations
export const userService = {
  async createUser(userData: { username: string; email: string; role: string; password: string }) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserByUsername(username: string) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getUserByEmail(email: string) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getUserById(id: string) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllUsers() {
    if (!isSupabaseConfigured()) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Quiz operations
export const quizService = {
  async createQuiz(quizData: {
    title: string;
    description: string;
    questions: Question[];
    time_limit: number;
    passing_score: number;
    created_by: string;
  }) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([{ ...quizData, is_active: true }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllQuizzes() {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getActiveQuizzes() {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getQuizById(id: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateQuiz(id: string, updates: Partial<Quiz>) {
    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteQuiz(id: string) {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleQuizActive(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('quizzes')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Quiz attempt operations
export const quizAttemptService = {
  async createAttempt(attemptData: {
    quiz_id: string;
    user_id: string;
    answers: any[];
    score: number;
    time_taken: number;
    passed: boolean;
  }) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([attemptData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserAttempts(userId: string) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes (
          title,
          description
        )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getQuizAttempts(quizId: string) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        users (
          username,
          email
        )
      `)
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getAllAttempts() {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        users (
          username,
          email
        ),
        quizzes (
          title,
          description
        )
      `)
      .order('completed_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getAttemptById(id: string) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        users (
          username,
          email
        ),
        quizzes (
          title,
          description,
          questions
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Analytics and statistics
export const analyticsService = {
  async getQuizStats() {
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id');
    
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('id, passed');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');
    
    if (quizzesError || attemptsError || usersError) {
      throw quizzesError || attemptsError || usersError;
    }
    
    const totalQuizzes = quizzes?.length || 0;
    const totalAttempts = attempts?.length || 0;
    const totalUsers = users?.length || 0;
    const passedAttempts = attempts?.filter(a => a.passed).length || 0;
    const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;
    
    return {
      totalQuizzes,
      totalAttempts,
      totalUsers,
      passRate: Math.round(passRate)
    };
  },

  async getRecentActivity(limit = 10) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        users (
          username
        ),
        quizzes (
          title
        )
      `)
      .order('completed_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};
