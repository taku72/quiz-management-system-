'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Activity,
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Filter
} from 'lucide-react';
import { SystemEvent, SystemEventType } from '@/utils/notificationUtils';
import { formatTimeAgo, formatMessageTime } from '@/utils/timeUtils';
import { supabase } from '@/lib/supabase';

interface RecentActivitiesProps {
  limit?: number;
  showFilters?: boolean;
  realTime?: boolean;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  limit = 20,
  showFilters = true,
  realTime = true
}) => {
  const [activities, setActivities] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SystemEventType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const getActivityIcon = (type: SystemEventType) => {
    switch (type) {
      case 'chat-message':
        return <MessageSquare className="w-4 h-4" />;
      case 'quiz-attempt':
        return <FileText className="w-4 h-4" />;
      case 'user-registration':
        return <Users className="w-4 h-4" />;
      case 'quiz-created':
        return <FileText className="w-4 h-4" />;
      case 'admin-action':
        return <CheckCircle className="w-4 h-4" />;
      case 'system-alert':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: SystemEventType) => {
    switch (type) {
      case 'chat-message':
        return 'bg-blue-100 text-blue-800';
      case 'quiz-attempt':
        return 'bg-green-100 text-green-800';
      case 'user-registration':
        return 'bg-purple-100 text-purple-800';
      case 'quiz-created':
        return 'bg-orange-100 text-orange-800';
      case 'admin-action':
        return 'bg-indigo-100 text-indigo-800';
      case 'system-alert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const loadActivities = async () => {
    try {
      setRefreshing(true);

      // Load different types of activities
      const activities: SystemEvent[] = [];

      // Load quiz attempts
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          users (username),
          quizzes (title)
        `)
        .order('completed_at', { ascending: false })
        .limit(10);

      attempts?.forEach((attempt: any) => {
        activities.push({
          id: `attempt-${attempt.id}`,
          type: 'quiz-attempt',
          title: 'Quiz Completed',
          message: `${attempt.users?.username || 'Unknown'} completed "${attempt.quizzes?.title || 'Quiz'}"`,
          userId: attempt.user_id,
          username: attempt.users?.username,
          timestamp: attempt.completed_at,
          data: {
            quizTitle: attempt.quizzes?.title,
            score: attempt.score,
            passed: attempt.passed
          },
          priority: attempt.passed ? 'low' : 'medium'
        });
      });

      // Load recent chat messages
      const { data: messages } = await supabase
        .from('chat_messages')
        .select(`
          *,
          users (username)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      messages?.forEach((message: any) => {
        activities.push({
          id: `message-${message.id}`,
          type: 'chat-message',
          title: 'New Message',
          message: message.message.length > 50
            ? `${message.message.substring(0, 50)}...`
            : message.message,
          userId: message.user_id,
          username: message.users?.username,
          timestamp: message.created_at,
          data: {
            messageType: message.message_type,
            roomId: message.room_id
          },
          priority: 'low'
        });
      });

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply filter
      const filteredActivities = filter === 'all'
        ? activities.slice(0, limit)
        : activities.filter(activity => activity.type === filter).slice(0, limit);

      setActivities(filteredActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [filter, limit]);

  // Real-time updates
  useEffect(() => {
    if (!realTime) return;

    const channels = [
      // Quiz attempts
      supabase
        .channel('quiz-attempts')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_attempts'
        }, () => loadActivities()),

      // Chat messages
      supabase
        .channel('chat-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        }, () => loadActivities())
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [realTime]);

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(activity => activity.type === filter);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Recent Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Recent Activities</span>
            {refreshing && <RefreshCw className="w-4 h-4 animate-spin" />}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {showFilters && (
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as SystemEventType | 'all')}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="all">All Activities</option>
                <option value="chat-message">Chat Messages</option>
                <option value="quiz-attempt">Quiz Attempts</option>
                <option value="user-registration">User Registrations</option>
                <option value="quiz-created">Quiz Creations</option>
                <option value="admin-action">Admin Actions</option>
                <option value="system-alert">System Alerts</option>
              </select>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={loadActivities}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activities</p>
            <p className="text-sm">Activities will appear here as they happen</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </h4>
                    {activity.priority && activity.priority !== 'low' && (
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(activity.priority)}`} />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {activity.message}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {activity.username && (
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{activity.username}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                    </span>
                  </div>

                  {/* Additional data for specific activity types */}
                  {activity.type === 'quiz-attempt' && activity.data && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.data.passed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.data.score}% {activity.data.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};