'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuizList } from './QuizList';
import { CreateQuizForm } from './CreateQuizForm';
import { QuizResults } from './QuizResults';
import { RecentActivities } from './RecentActivities';
import { QuizAnalyticsDashboard } from './QuizAnalyticsDashboard';
import { PendingRegistrations } from './PendingRegistrations';
import { ChatRoomList, ChatRoom } from '@/components/chat';
import { Plus, BarChart3, BookOpen, Users, MessageSquare, TrendingUp, UserCheck } from 'lucide-react';
import { analyticsService, pendingRegistrationService } from '@/lib/database';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemNotifications } from '@/hooks/useSystemNotifications';
import { ChatRoom as ChatRoomType } from '@/types';

type ActiveTab = 'overview' | 'analytics' | 'quizzes' | 'create' | 'results' | 'chat' | 'registrations';

export const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
    const [stats, setStats] = useState({
      totalQuizzes: 0,
      totalAttempts: 0,
      totalUsers: 0,
      passRate: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoomType | null>(null);
    const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState(0);

    // System notifications for admins
    useSystemNotifications({
      userId: user?.id || '',
      isAdmin: user?.role === 'admin',
      onEvent: (event) => {
        console.log('System event:', event);
        // Could trigger a toast notification or update a notification badge
      }
    });

  // Make loadPendingRegistrationsCount available to child components
  const loadPendingRegistrationsCount = async () => {
    try {
      const pendingRegs = await pendingRegistrationService.getPendingRegistrations();
      setPendingRegistrationsCount(pendingRegs?.length || 0);
    } catch (error) {
      console.error('Error loading pending registrations count:', error);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await analyticsService.getQuizStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
    loadPendingRegistrationsCount();

    // Poll for pending registrations every 30 seconds
    const interval = setInterval(loadPendingRegistrationsCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <QuizAnalyticsDashboard />;
      case 'registrations':
        return <PendingRegistrations onRegistrationProcessed={loadPendingRegistrationsCount} />;
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
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
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.passRate}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <RecentActivities limit={10} showFilters={true} realTime={true} />
          </div>
        );
      case 'quizzes':
        return <QuizList />;
      case 'create':
        return <CreateQuizForm onSuccess={() => setActiveTab('quizzes')} />;
      case 'results':
        return <QuizResults />;
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage quizzes and monitor student performance</p>
        </div>
        <Button
          onClick={() => setActiveTab('create')}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Quiz</span>
        </Button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'quizzes', label: 'Quizzes', icon: BookOpen },
            { id: 'create', label: 'Create Quiz', icon: Plus },
            { id: 'results', label: 'Results', icon: Users },
            {
              id: 'registrations',
              label: 'Registrations',
              icon: UserCheck,
              badge: pendingRegistrationsCount > 0 ? pendingRegistrationsCount : undefined
            },
            { id: 'chat', label: 'Chat', icon: MessageSquare }
          ].map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as ActiveTab)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm relative ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {badge && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
                  {badge > 99 ? '99+' : badge}
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
