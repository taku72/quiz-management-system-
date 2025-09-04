import { User, Quiz, QuizAttempt } from '@/types';

// Mock data for development - in production, this would be replaced with a database
export let users: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@quiz.com',
    role: 'admin',
    name: 'Administrator'
  },
  {
    id: '2',
    username: 'student1',
    password: 'student123',
    email: 'john@student.com',
    role: 'student',
    name: 'John Doe'
  },
  {
    id: '3',
    username: 'student2',
    password: 'student123',
    email: 'jane@student.com',
    role: 'student',
    name: 'Jane Smith'
  }
];

// Helper functions for user management
export const addUser = (user: User) => {
  users.push(user);
};

export const findUserByUsername = (username: string) => {
  return users.find(u => u.username === username);
};

export const findUserByEmail = (email: string) => {
  return users.find(u => u.email === email);
};

export let quizzes: Quiz[] = [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics',
    questions: [
      {
        id: '1',
        type: 'multiple-choice',
        question: 'What is the correct way to declare a variable in JavaScript?',
        options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
        correctAnswer: 0,
        points: 10
      },
      {
        id: '2',
        type: 'true-false',
        question: 'JavaScript is a compiled language.',
        correctAnswer: false,
        points: 10
      },
      {
        id: '3',
        type: 'multiple-choice',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'add()', 'append()', 'insert()'],
        correctAnswer: 0,
        points: 10
      }
    ],
    passingScore: 60,
    createdBy: '1',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '2',
    title: 'React Basics',
    description: 'Fundamental concepts of React development',
    questions: [
      {
        id: '4',
        type: 'multiple-choice',
        question: 'What is JSX?',
        options: ['A JavaScript extension', 'A CSS framework', 'A database', 'A testing library'],
        correctAnswer: 0,
        points: 15
      },
      {
        id: '5',
        type: 'true-false',
        question: 'React components must always return a single element.',
        correctAnswer: false,
        points: 10
      },
      {
        id: '6',
        type: 'multiple-choice',
        question: 'Which hook is used for state management in functional components?',
        options: ['useEffect', 'useState', 'useContext', 'useReducer'],
        correctAnswer: 1,
        points: 15
      },
      {
        id: '7',
        type: 'true-false',
        question: 'Props are mutable in React.',
        correctAnswer: false,
        points: 10
      }
    ],
    passingScore: 70,
    createdBy: '1',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    isActive: true
  },
  {
    id: '3',
    title: 'Web Development Basics',
    description: 'Essential web development concepts and technologies',
    questions: [
      {
        id: '8',
        type: 'multiple-choice',
        question: 'What does HTML stand for?',
        options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
        correctAnswer: 0,
        points: 5
      },
      {
        id: '9',
        type: 'true-false',
        question: 'CSS stands for Cascading Style Sheets.',
        correctAnswer: true,
        points: 5
      },
      {
        id: '10',
        type: 'multiple-choice',
        question: 'Which HTTP method is used to retrieve data?',
        options: ['POST', 'GET', 'PUT', 'DELETE'],
        correctAnswer: 1,
        points: 10
      },
      {
        id: '11',
        type: 'true-false',
        question: 'JavaScript can only run in web browsers.',
        correctAnswer: false,
        points: 10
      },
      {
        id: '12',
        type: 'multiple-choice',
        question: 'What is the purpose of the <head> tag in HTML?',
        options: ['To display content', 'To contain metadata', 'To create links', 'To add images'],
        correctAnswer: 1,
        points: 10
      }
    ],
    passingScore: 60,
    createdBy: '1',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    isActive: false
  }
];

export let quizAttempts: QuizAttempt[] = [
  {
    id: '1',
    quizId: '1',
    studentId: '2',
    answers: [0, false, 0],
    score: 100,
    passed: true,
    completedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    timeSpent: 180
  },
  {
    id: '2',
    quizId: '2',
    studentId: '2',
    answers: [0, true, 1, false],
    score: 75,
    passed: true,
    completedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    timeSpent: 240
  },
  {
    id: '3',
    quizId: '1',
    studentId: '3',
    answers: [1, true, 2],
    score: 33,
    passed: false,
    completedAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    timeSpent: 150
  }
];

// Helper functions for data manipulation
export const addQuiz = (quiz: Quiz) => {
  quizzes.push(quiz);
};

export const updateQuiz = (id: string, updatedQuiz: Partial<Quiz>) => {
  const index = quizzes.findIndex(q => q.id === id);
  if (index !== -1) {
    quizzes[index] = { ...quizzes[index], ...updatedQuiz };
  }
};

export const deleteQuiz = (id: string) => {
  quizzes = quizzes.filter(q => q.id !== id);
};

export const addQuizAttempt = (attempt: QuizAttempt) => {
  quizAttempts.push(attempt);
};

export const getQuizAttemptsByStudent = (studentId: string) => {
  return quizAttempts.filter(attempt => attempt.studentId === studentId);
};

export const getQuizAttemptsByQuiz = (quizId: string) => {
  return quizAttempts.filter(attempt => attempt.quizId === quizId);
};
