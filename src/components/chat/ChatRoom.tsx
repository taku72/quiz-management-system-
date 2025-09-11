'use client';

import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { ChatMessage, ChatRoom as ChatRoomType } from '@/types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Settings, Bell } from 'lucide-react';
import { NotificationSettings } from '@/components/NotificationSettings';
import { requestNotificationPermission, showChatNotification } from '@/utils/notificationUtils';

// Presence: show online users count in this room
interface PresenceState {
  onlineUserIds: string[];
}

interface ChatRoomProps {
  room: ChatRoomType;
  currentUserId: string;
  isAdmin?: boolean;
  onClose?: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ room, currentUserId, isAdmin = false, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; username: string; timestamp: number }>>([]);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [presence, setPresence] = useState<PresenceState>({ onlineUserIds: [] });
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadMessages();
  }, [room.id]);

  // Request notification permission when the chat room mounts
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat_messages:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${room.id}`
        },
        async (payload: any) => {
          // Transform snake_case to camelCase and fetch user data
          const rawMessage = payload.new;

          // Only fetch user data for non-system messages
          let userData = null;
          if (rawMessage.message_type !== 'system' && rawMessage.message_type !== 'announcement') {
            const { data } = await supabase
              .from('users')
              .select('username, email')
              .eq('id', rawMessage.user_id)
              .single();
            userData = data;
          }

          const newMessage: ChatMessage = {
            id: rawMessage.id,
            roomId: rawMessage.room_id,
            userId: rawMessage.user_id,
            message: rawMessage.message,
            messageType: rawMessage.message_type,
            quizContext: rawMessage.quiz_context,
            createdAt: rawMessage.created_at,
            user: userData ? {
              username: userData.username,
              email: userData.email
            } : undefined
          };

          // Show browser notification for messages from others
          try {
            if (rawMessage.user_id !== currentUserId && userData?.username) {
              await showChatNotification(userData.username, rawMessage.message, room.name);
            }
          } catch (e) {
            console.warn('Notification failed:', e);
          }

          setMessages(prevMessages => {
            // Check if message already exists to avoid duplicates
            if (prevMessages.some(msg => msg.id === newMessage.id)) {
              return prevMessages;
            }

            // Check if this is replacing an optimistic message (same content, different ID)
            const existingOptimisticIndex = prevMessages.findIndex(msg =>
              msg.id.startsWith('temp-') &&
              msg.message === newMessage.message &&
              msg.userId === newMessage.userId &&
              msg.roomId === newMessage.roomId
            );

            if (existingOptimisticIndex !== -1) {
              // Replace optimistic message with real message
              const updatedMessages = [...prevMessages];
              updatedMessages[existingOptimisticIndex] = newMessage;
              return updatedMessages;
            }

            return [...prevMessages, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${room.id}`
        },
        (payload: any) => {
          const deletedMessage = payload.old;
          setMessages(prevMessages =>
            prevMessages.filter(msg => msg.id !== deletedMessage.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id]);

  // Typing indicator subscription + Presence tracking
  useEffect(() => {
    const typingChannel = supabase.channel(`typing:${room.id}`)
      .on('broadcast', { event: 'typing' }, (payload: any) => {
        const typingData = payload.payload;

        setTypingUsers(prev => {
          const filtered = prev.filter(user =>
            user.userId !== typingData.userId
          );

        if (typingData.isTyping) {
            // Add user to typing list
            const newTypingUser = {
              userId: typingData.userId,
              username: typingData.username,
              timestamp: typingData.timestamp
            };
            return [...filtered, newTypingUser];
          } else {
            // Remove user from typing list
            return filtered;
          }
        });
      })
      .subscribe();

    // Presence: track online users by joining a presence channel
    const presenceChannel = supabase.channel(`presence:${room.id}`, {
      config: {
        presence: { key: `user-${currentUserId}` }
      }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        // state is an object keyed by presence key; values are arrays of metas
        const ids = Object.keys(state).map(k => k.replace('user-', ''));
        setPresence({ onlineUserIds: ids });
      })
      .subscribe(async (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online: true, at: Date.now(), roomId: room.id });
        }
      });

    return () => {
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [room.id, currentUserId]);

  // Clean up expired typing indicators
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev =>
        prev.filter(user => now - user.timestamp < 5000) // Remove after 5 seconds
      );
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const roomMessages = await chatService.getMessagesByRoom(room.id);
      setMessages(roomMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    const messageText = message.trim();
    if (!messageText) return;

    // Create optimistic message for immediate display
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`, // Temporary ID
      roomId: room.id,
      userId: currentUserId,
      message: messageText,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      user: {
        username: 'You', // Will be replaced with real username
        email: ''
      }
    };

    // Add message to UI immediately (optimistic update)
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    try {
      const result = await chatService.sendMessage({
        room_id: room.id,
        user_id: currentUserId,
        message: messageText,
        message_type: 'text'
      });

      // Replace optimistic message with real message from database
      if (result) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === optimisticMessage.id
              ? {
                  id: result.id,
                  roomId: result.room_id,
                  userId: result.user_id,
                  message: result.message,
                  messageType: result.message_type,
                  createdAt: result.created_at,
                  user: {
                    username: 'You', // This should be fetched from user context
                    email: ''
                  }
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== optimisticMessage.id)
      );
    }
  };


  const handleDeleteMessages = async (messageIds: string[]) => {
    // If called from single delete button, confirmation is already handled
    // If called from bulk delete, show confirmation
    if (messageIds.length > 1) {
      if (!confirm(`Are you sure you want to delete ${messageIds.length} messages?`)) {
        return;
      }
    }

    try {
      // Delete messages from database
      for (const messageId of messageIds) {
        if (!messageId.startsWith('temp-')) { // Don't try to delete optimistic messages from DB
          const { error } = await supabase
            .from('chat_messages')
            .delete()
            .eq('id', messageId);

          if (error) throw error;
        }
      }

      // Remove from local state (this will be handled by real-time subscription for other users)
      setMessages(prev => prev.filter(msg => !messageIds.includes(msg.id)));
    } catch (error) {
      console.error('Failed to delete messages:', error);
      alert('Failed to delete messages. Please try again.');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <CardTitle className="text-lg">{room.name}</CardTitle>
          </div>
          <div className="flex items-center space-x-3">
            {/* Online count */}
            <div className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              {presence.onlineUserIds.length} online
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotificationSettings(!showNotificationSettings)}
              className="flex items-center space-x-1"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
        {room.description && (
          <p className="text-sm text-gray-600">{room.description}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            loading={loading}
            currentUserId={currentUserId}
            messagesEndRef={messagesEndRef}
            onDeleteMessages={handleDeleteMessages}
            isAdmin={isAdmin}
          />
          <TypingIndicator
            typingUsers={typingUsers}
            currentUserId={currentUserId}
          />
        </div>

        <div className="flex-shrink-0 mt-4">
          <MessageInput
            onSendMessage={handleSendMessage}
            placeholder={`Message ${room.name}...`}
            disabled={loading}
            roomId={room.id}
            currentUserId={currentUserId}
            username="Current User" // This should be fetched from user context
          />
        </div>
      </CardContent>

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <NotificationSettings
            onClose={() => setShowNotificationSettings(false)}
          />
        </div>
      )}
    </Card>
  );
};
