'use client';

import React, { useState, useEffect } from 'react';
import { quizzes, getQuizAttemptsByStudent } from '@/lib/data';
import { quizService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuizAttempt } from './QuizAttempt';
import { StudentHistory } from './StudentHistory';
import { BookOpen, Clock, Trophy, Target } from 'lucide-react';

type ActiveTab = 'available' | 'history';

export const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('available');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      // Try to load from database first
      const dbQuizzes = await quizService.getActiveQuizzes();
      if (dbQuizzes && dbQuizzes.length > 0) {
        // Parse questions from JSON string to array
        const parsedQuizzes = dbQuizzes.map((quiz: any) => ({
          ...quiz,
          questions: typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions
        }));
        setAvailableQuizzes(parsedQuizzes);
      } else {
        // Fallback to mock data
        const mockQuizzes = quizzes
          .filter(quiz => quiz.isActive)
          .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        setAvailableQuizzes(mockQuizzes);
      }
    } catch (error) {
      console.log('Database load failed, using mock data:', error);
      // Fallback toop mock data
      const mockQuizzes = quizzes
        .filter(quiz => quiz.isActive)
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      setAvailableQuizzes(mockQuizzes);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const studentAttempts = getQuizAttemptsByStudent(user.id);
  
  const stats = {
    totalAttempts: studentAttempts.length,
    passedQuizzes: studentAttempts.filter(attempt => attempt.passed).length,
    averageScore: studentAttempts.length > 0 
      ? Math.round(studentAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / studentAttempts.length)
      : 0,
    availableQuizzes: availableQuizzes.length
  };

  if (selectedQuizId) {
    const quiz = availableQuizzes.find(q => q.id === selectedQuizId);
    if (quiz) {
      return (
        <QuizAttempt 
          quiz={quiz} 
          onComplete={() => setSelectedQuizId(null)}
          onCancel={() => setSelectedQuizId(null)}
        />
      );
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'available':
        return (
          <div className="space-y-6">
            {availableQuizzes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes available</h3>
                  <p className="text-gray-600">Check back later for new quizzes</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {availableQuizzes.map((quiz) => {
                  const hasAttempted = studentAttempts.some(attempt => attempt.quizId === quiz.id);
                  const lastAttempt = studentAttempts
                    .filter(attempt => attempt.quizId === quiz.id)
                    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
                  const hasPassed = lastAttempt?.passed || false;

                  return (
                    <Card key={quiz.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{quiz.title}</CardTitle>
                            <p className="text-gray-600 mt-1">{quiz.description}</p>
                          </div>
                          {hasAttempted && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              lastAttempt?.passed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {lastAttempt?.passed ? 'Passed' : 'Failed'}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{quiz.questions.length}</p>
                            <p className="text-sm text-blue-800">Questions</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{quiz.passingScore}%</p>
                            <p className="text-sm text-green-800">Pass Score</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">
                              {quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0)}
                            </p>
                            <p className="text-sm text-purple-800">Total Points</p>
                          </div>
                        </div>

                        {hasAttempted && lastAttempt && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              Last attempt: <span className="font-medium">{lastAttempt.score}%</span> on{' '}
                              {new Date(lastAttempt.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            <p>Estimated time: {Math.ceil(quiz.questions.length * 1.5)} minutes</p>
                          </div>
                          {hasPassed ? (
                            <div className="flex items-center space-x-2 text-green-600">
                              <BookOpen className="w-4 h-4" />
                              <span className="font-medium">Completed</span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setSelectedQuizId(quiz.id)}
                              className="flex items-center space-x-2"
                            >
                              <BookOpen className="w-4 h-4" />
                              <span>{hasAttempted ? 'Retake Quiz' : 'Start Quiz'}</span>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'history':
        return <StudentHistory />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}! Ready to take some quizzes?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Quizzes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.availableQuizzes}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAttempts}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quizzes Passed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.passedQuizzes}</p>
              </div>
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'available', label: 'Available Quizzes', icon: BookOpen },
            { id: 'history', label: 'My History', icon: Clock }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as ActiveTab)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {renderContent()}
    </div>
  );
};
