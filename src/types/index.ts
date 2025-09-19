export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'student';
  name: string;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false';
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string | number | boolean; // Index for multiple choice, boolean for true/false
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number; // Percentage (0-100)
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  // Optional time limit in minutes. Either camelCase (local) or snake_case (DB)
  timeLimit?: number;
  time_limit?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: (string | number | boolean)[];
  score: number;
  passed: boolean;
  completedAt: string;
  timeSpent: number; // in seconds
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  type: 'quiz' | 'study' | 'general';
  quizId?: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  message: string;
  messageType: 'text' | 'system' | 'announcement';
  quizContext?: any;
  createdAt: string;
  user?: {
    username: string;
    email: string;
  };
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  quizId: string;
  createdBy: string;
  maxMembers: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStudyGroup {
  id: string;
  userId: string;
  groupId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
}

export type LoginResult = {
  success: boolean;
  error?: 'invalid_credentials' | 'pending_approval' | 'rejected' | 'unknown';
  message?: string;
};

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: { name?: string; username?: string; email?: string }) => Promise<boolean>;
  isLoading: boolean;
}

export interface PendingRegistration {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'student';
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}
