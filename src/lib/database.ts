import { supabase } from './supabase';
import { User, Quiz, QuizAttempt, Question, ChatRoom, ChatMessage, StudyGroup, UserStudyGroup } from '@/types';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && url !== 'https://placeholder.supabase.co' && key && key !== 'your-anon-key';
};

// User operations
export const userService = {
  async createUser(userData: { id?: string; username: string; email: string; role: string; password?: string }) {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const insertData = userData.id
      ? { id: userData.id, username: userData.username, email: userData.email, role: userData.role, password: userData.password }
      : { username: userData.username, email: userData.email, role: userData.role, password: userData.password };

    const { data, error } = await supabase
      .from('users')
      .insert([insertData])
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
      .select('id, username, email, role, password, created_at, updated_at')
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
      .select('id, username, email, role, password, created_at, updated_at')
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
      .select('id, username, email, role, password, created_at, updated_at')
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
      .select('id, username, email, role, password, created_at, updated_at')
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
    const passedAttempts = attempts?.filter((a: any) => a.passed).length || 0;
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

// Chat services
export const chatService = {
  // Chat room operations
  async createChatRoom(roomData: {
    name: string;
    description: string;
    type: 'quiz' | 'study' | 'general';
    quiz_id?: string;
    created_by: string;
  }) {
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert([roomData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getChatRoomsByQuiz(quizId: string) {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAllActiveChatRooms() {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getChatRoomById(id: string) {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Chat message operations
  async sendMessage(messageData: {
    room_id: string;
    user_id: string;
    message: string;
    message_type?: 'text' | 'system' | 'announcement';
    quiz_context?: any;
  }) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([messageData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMessagesByRoom(roomId: string, limit = 50) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        users (
          username,
          email
        )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Transform snake_case to camelCase to match ChatMessage type
    const transformedData = data?.map((msg: any) => ({
      id: msg.id,
      roomId: msg.room_id,
      userId: msg.user_id,
      message: msg.message,
      messageType: msg.message_type,
      quizContext: msg.quiz_context,
      createdAt: msg.created_at,
      user: (msg.message_type === 'system' || msg.message_type === 'announcement')
        ? undefined
        : msg.users ? {
            username: msg.users.username,
            email: msg.users.email
          } : undefined
    })) || [];

    return transformedData.reverse();
  },

  // Study group operations
  async createStudyGroup(groupData: {
    name: string;
    description: string;
    quiz_id: string;
    created_by: string;
    max_members?: number;
  }) {
    const { data, error } = await supabase
      .from('study_groups')
      .insert([groupData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStudyGroupsByQuiz(quizId: string) {
    const { data, error } = await supabase
      .from('study_groups')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async joinStudyGroup(userId: string, groupId: string) {
    const { data, error } = await supabase
      .from('user_study_groups')
      .insert([{
        user_id: userId,
        group_id: groupId,
        role: 'member'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserStudyGroups(userId: string) {
    const { data, error } = await supabase
      .from('user_study_groups')
      .select(`
        *,
        study_groups (
          name,
          description,
          quiz_id,
          is_active
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async getStudyGroupMembers(groupId: string) {
    const { data, error } = await supabase
      .from('user_study_groups')
      .select(`
        *,
        users (
          username,
          email
        )
      `)
      .eq('group_id', groupId);

    if (error) throw error;
    return data;
  }
};
