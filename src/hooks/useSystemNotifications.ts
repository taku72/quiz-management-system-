import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { showSystemEventNotification, SystemEvent, SystemEventType } from '@/utils/notificationUtils';

interface UseSystemNotificationsProps {
  userId: string;
  isAdmin?: boolean;
  onEvent?: (event: SystemEvent) => void;
}

export const useSystemNotifications = ({
  userId,
  isAdmin = false,
  onEvent
}: UseSystemNotificationsProps) => {

  const handleQuizAttempt = useCallback(async (payload: any) => {
    const attempt = payload.new;

    try {
      // Get user and quiz information
      const { data: userData } = await supabase
        .from('users')
        .select('username')
        .eq('id', attempt.user_id)
        .single();

      const { data: quizData } = await supabase
        .from('quizzes')
        .select('title')
        .eq('id', attempt.quiz_id)
        .single();

      if (userData && quizData) {
        const event: SystemEvent = {
          id: `attempt-${attempt.id}`,
          type: 'quiz-attempt',
          title: 'Quiz Completed',
          message: `${userData.username} completed "${quizData.title}" with ${attempt.score}%`,
          userId: attempt.user_id,
          username: userData.username,
          timestamp: attempt.completed_at,
          data: {
            quizTitle: quizData.title,
            score: attempt.score,
            passed: attempt.passed
          },
          priority: attempt.passed ? 'low' : 'medium'
        };

        // Show notification for admins
        if (isAdmin) {
          await showSystemEventNotification(event);
        }

        // Call the event handler
        onEvent?.(event);
      }
    } catch (error) {
      console.error('Failed to process quiz attempt notification:', error);
    }
  }, [isAdmin, onEvent]);

  const handleUserRegistration = useCallback(async (payload: any) => {
    const user = payload.new;

    const event: SystemEvent = {
      id: `user-${user.id}`,
      type: 'user-registration',
      title: 'New User Registered',
      message: `${user.username} joined the platform`,
      userId: user.id,
      username: user.username,
      timestamp: user.created_at,
      priority: 'medium'
    };

    // Show notification for admins
    if (isAdmin) {
      await showSystemEventNotification(event);
    }

    // Call the event handler
    onEvent?.(event);
  }, [isAdmin, onEvent]);

  const handleQuizCreation = useCallback(async (payload: any) => {
    const quiz = payload.new;

    try {
      // Get creator information
      const { data: creatorData } = await supabase
        .from('users')
        .select('username')
        .eq('id', quiz.created_by)
        .single();

      if (creatorData) {
        const event: SystemEvent = {
          id: `quiz-${quiz.id}`,
          type: 'quiz-created',
          title: 'New Quiz Created',
          message: `${creatorData.username} created "${quiz.title}"`,
          userId: quiz.created_by,
          username: creatorData.username,
          timestamp: quiz.created_at,
          data: {
            quizTitle: quiz.title,
            quizId: quiz.id
          },
          priority: 'low'
        };

        // Show notification for admins
        if (isAdmin) {
          await showSystemEventNotification(event);
        }

        // Call the event handler
        onEvent?.(event);
      }
    } catch (error) {
      console.error('Failed to process quiz creation notification:', error);
    }
  }, [isAdmin, onEvent]);

  const handleChatMessage = useCallback(async (payload: any) => {
    const message = payload.new;

    // Skip if it's our own message
    if (message.user_id === userId) return;

    try {
      // Get sender information
      const { data: senderData } = await supabase
        .from('users')
        .select('username')
        .eq('id', message.user_id)
        .single();

      // Get room information
      const { data: roomData } = await supabase
        .from('chat_rooms')
        .select('name')
        .eq('id', message.room_id)
        .single();

      if (senderData) {
        const event: SystemEvent = {
          id: `chat-${message.id}`,
          type: 'chat-message',
          title: 'New Chat Message',
          message: message.message.length > 50
            ? `${message.message.substring(0, 50)}...`
            : message.message,
          userId: message.user_id,
          username: senderData.username,
          timestamp: message.created_at,
          data: {
            roomName: roomData?.name,
            roomId: message.room_id,
            messageType: message.message_type
          },
          priority: 'low'
        };

        // Show notification for admins or if mentioned
        if (isAdmin || message.message.toLowerCase().includes('@admin')) {
          await showSystemEventNotification(event);
        }

        // Call the event handler
        onEvent?.(event);
      }
    } catch (error) {
      console.error('Failed to process chat message notification:', error);
    }
  }, [userId, isAdmin, onEvent]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    const channels: any[] = [];

    // Quiz attempts
    if (isAdmin) {
      channels.push(
        supabase
          .channel('system-quiz-attempts')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'quiz_attempts'
          }, handleQuizAttempt)
      );
    }

    // User registrations
    if (isAdmin) {
      channels.push(
        supabase
          .channel('system-user-registrations')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'users'
          }, handleUserRegistration)
      );
    }

    // Quiz creations
    if (isAdmin) {
      channels.push(
        supabase
          .channel('system-quiz-creations')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'quizzes'
          }, handleQuizCreation)
      );
    }

    // Chat messages (for admins or mentions)
    channels.push(
      supabase
        .channel('system-chat-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=neq.${userId}` // Only messages from other users
        }, handleChatMessage)
    );

    // Subscribe to all channels
    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userId, isAdmin, handleQuizAttempt, handleUserRegistration, handleQuizCreation, handleChatMessage]);

  return {
    // This hook mainly sets up subscriptions and triggers notifications
    // The actual event handling is done through the onEvent callback
  };
};