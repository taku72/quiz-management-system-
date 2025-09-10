import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { showChatNotification, requestNotificationPermission } from '@/utils/notificationUtils';

interface NotificationState {
  unreadCount: number;
  lastReadTimestamp: string;
}

export const useNotifications = (userId: string) => {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    unreadCount: 0,
    lastReadTimestamp: new Date().toISOString()
  });

  const markAsRead = useCallback(() => {
    setNotificationState(prev => ({
      ...prev,
      unreadCount: 0,
      lastReadTimestamp: new Date().toISOString()
    }));
  }, []);

  const incrementUnread = useCallback(() => {
    setNotificationState(prev => ({
      ...prev,
      unreadCount: prev.unreadCount + 1
    }));
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Request notification permission on first load
    requestNotificationPermission();

    // Subscribe to new messages across all chat rooms
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=neq.${userId}` // Only messages from other users
        },
        async (payload: any) => {
          const message = payload.new;
          const messageTime = new Date(message.created_at);
          const lastReadTime = new Date(notificationState.lastReadTimestamp);

          // Only process if message is newer than last read time
          if (messageTime > lastReadTime) {
            incrementUnread();

            // Show browser notification for new messages
            try {
              // Get sender information
              const { data: sender } = await supabase
                .from('users')
                .select('username')
                .eq('id', message.user_id)
                .single();

              // Get room information
              const { data: room } = await supabase
                .from('chat_rooms')
                .select('name')
                .eq('id', message.room_id)
                .single();

              if (sender) {
                await showChatNotification(
                  sender.username,
                  message.message,
                  room?.name
                );
              }
            } catch (error) {
              console.error('Failed to show notification:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, notificationState.lastReadTimestamp, incrementUnread]);

  return {
    unreadCount: notificationState.unreadCount,
    markAsRead,
    incrementUnread
  };
};