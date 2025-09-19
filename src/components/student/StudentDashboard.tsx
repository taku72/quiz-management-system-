'use client';

import React, { useState, useEffect } from 'react';
import { quizzes, getQuizAttemptsByStudent } from '@/lib/data';
import { quizService, quizAttemptService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuizAttempt } from './QuizAttempt';
import { StudentHistory } from './StudentHistory';
import { ChatRoomList, ChatRoom } from '@/components/chat';
import { BookOpen, Clock, Trophy, Target, MessageSquare } from 'lucide-react';
import { StudentQuizCard } from './StudentQuizCard';
import { ChatRoom as ChatRoomType } from '@/types';

type ActiveTab = 'available' | 'history' | 'chat';

export const StudentDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('available');
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoomType | null>(null);
    const [studentAttempts, setStudentAttempts] = useState<any[]>([]);
    const { user } = useAuth();
    const { unreadCount, markAsRead } = useNotifications(user?.id || '');

  useEffect(() => {
     loadQuizzes();
     loadStudentAttempts();
   }, [user?.id]);

   const loadStudentAttempts = async () => {
     if (!user) return;

     try {
       // Try to fetch from database first
       const dbAttempts = await quizAttemptService.getUserAttempts(user.id);
       if (dbAttempts && dbAttempts.length > 0) {
         // Transform database format to match component expectations
         const transformedAttempts = dbAttempts.map((attempt: any) => ({
           id: attempt.id,
           quizId: attempt.quiz_id,
           studentId: attempt.user_id,
           answers: attempt.answers,
           score: attempt.score,
           passed: attempt.passed,
           completedAt: attempt.completed_at,
           timeSpent: attempt.time_taken
         }));
         setStudentAttempts(transformedAttempts);
       } else {
         // Fallback to mock data
         const mockAttempts = getQuizAttemptsByStudent(user.id);
         setStudentAttempts(mockAttempts);
       }
     } catch (error) {
       console.log('Database fetch failed, using mock data:', error);
       // Fallback to mock data
       const mockAttempts = getQuizAttemptsByStudent(user.id);
       setStudentAttempts(mockAttempts);
     }
   };

   const handleTabChange = (tab: ActiveTab) => {
     setActiveTab(tab);
     if (tab === 'chat') {
       // Clear unread message notifications when viewing chat
       markAsRead();
     }
   };

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
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">No quizzes available</h3>
                  <p className="text-gray-600">Check back later for new quizzes</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {availableQuizzes.map((quiz) => {
                  const hasAttempted = studentAttempts.some(attempt => attempt.quizId === quiz.id);
                  const lastAttempt = studentAttempts
                    .filter(attempt => attempt.quizId === quiz.id)
                    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

                  return (
                    <StudentQuizCard
                      key={quiz.id}
                      quiz={quiz}
                      hasAttempted={hasAttempted}
                      lastAttempt={lastAttempt || null}
                      onStart={() => setSelectedQuizId(quiz.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'history':
        return <StudentHistory />;
      case 'chat':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            <div className="lg:col-span-1">
              <ChatRoomList
                onRoomSelect={setSelectedChatRoom}
                selectedRoomId={selectedChatRoom?.id}
                currentUserId={user?.id || ''}
              />
            </div>
            <div className="lg:col-span-2">
              {selectedChatRoom ? (
                <ChatRoom
                  room={selectedChatRoom}
                  currentUserId={user?.id || ''}
                  isAdmin={user?.role === 'admin'}
                  onClose={() => setSelectedChatRoom(null)}
                />
              ) : (
                <Card className="flex items-center justify-center h-full">
                  <CardContent className="text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a chat room to start messaging</p>
                    <p className="mt-2 text-sm">Discuss quiz topics and get help from peers!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
        <nav className="flex space-x-4 overflow-x-auto md:space-x-8 scrollbar-hide">
          {[
            { id: 'available', label: 'Available Quizzes', icon: BookOpen },
            { id: 'history', label: 'My History', icon: Clock },
            { id: 'chat', label: 'Study Chat', icon: MessageSquare }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id as ActiveTab)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm relative whitespace-nowrap ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {id === 'chat' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {renderContent()}
    </div>
  );
};
