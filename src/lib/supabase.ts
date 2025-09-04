import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return url.includes('supabase.co');
  } catch {
    return false;
  }
};

// Create a mock client if URL is invalid (for development)
export const supabase = isValidUrl(supabaseUrl) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : {
      auth: {
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => ({ error: { message: 'Supabase not configured' } }),
        insert: () => ({ error: { message: 'Supabase not configured' } }),
        update: () => ({ error: { message: 'Supabase not configured' } }),
        delete: () => ({ error: { message: 'Supabase not configured' } }),
        eq: () => ({ error: { message: 'Supabase not configured' } }),
        single: () => ({ error: { message: 'Supabase not configured' } })
      })
    } as any;

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          role: 'admin' | 'student';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          role: 'admin' | 'student';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          role?: 'admin' | 'student';
          created_at?: string;
          updated_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          title: string;
          description: string;
          questions: any[];
          time_limit: number;
          passing_score: number;
          is_active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          questions: any[];
          time_limit: number;
          passing_score: number;
          is_active?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          questions?: any[];
          time_limit?: number;
          passing_score?: number;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          user_id: string;
          answers: any[];
          score: number;
          time_taken: number;
          completed_at: string;
          passed: boolean;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          user_id: string;
          answers: any[];
          score: number;
          time_taken: number;
          completed_at?: string;
          passed: boolean;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          user_id?: string;
          answers?: any[];
          score?: number;
          time_taken?: number;
          completed_at?: string;
          passed?: boolean;
        };
      };
    };
  };
}
