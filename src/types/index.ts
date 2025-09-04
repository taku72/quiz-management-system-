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

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
