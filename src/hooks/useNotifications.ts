import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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
        (payload: any) => {
          const message = payload.new;
          const messageTime = new Date(message.created_at);
          const lastReadTime = new Date(notificationState.lastReadTimestamp);

          // Only increment if message is newer than last read time
          if (messageTime > lastReadTime) {
            incrementUnread();
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