'use client';

import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { useNotifications } from '@/hooks/useNotifications';
import { ChatMessage, ChatRoom as ChatRoomType } from '@/types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Users, Settings, Shield, Bell, Edit3, Check } from 'lucide-react';

interface ChatRoomProps {
  room: ChatRoomType;
  currentUserId: string;
  isAdmin?: boolean;
  onClose?: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ room, currentUserId, isAdmin = false, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [customAnnouncement, setCustomAnnouncement] = useState('');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { markAsRead } = useNotifications(currentUserId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadMessages();
    // Mark messages as read when opening the room
    markAsRead();
  }, [room.id, markAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time subscription for new messages and deletions
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
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${room.id}`
        },
        (payload: any) => {
          const updatedMessage = payload.new;
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === updatedMessage.id
                ? {
                    ...msg,
                    message: updatedMessage.message,
                    messageType: updatedMessage.message_type
                  }
                : msg
            )
          );
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
          // Also remove from selected messages if it was selected
          setSelectedMessages(prev => prev.filter(id => id !== deletedMessage.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id]);

  // Presence tracking for online users
  useEffect(() => {
    const presenceChannel = supabase.channel(`presence:${room.id}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    // Track when users join/leave
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        const onlineCount = Object.keys(presenceState).length;
        setOnlineUsers(onlineCount);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string; newPresences: any[] }) => {
        console.log('User joined:', key, newPresences);
        const presenceState = presenceChannel.presenceState();
        const onlineCount = Object.keys(presenceState).length;
        setOnlineUsers(onlineCount);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string; leftPresences: any[] }) => {
        console.log('User left:', key, leftPresences);
        const presenceState = presenceChannel.presenceState();
        const onlineCount = Object.keys(presenceState).length;
        setOnlineUsers(onlineCount);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          // Track current user as online
          await presenceChannel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
    };
  }, [room.id, currentUserId]);

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
      user: undefined // Will be populated by real-time subscription
    };

    // Add message to UI immediately (optimistic update)
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    try {
      // Send to database
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
                  user: undefined // Will be populated by real-time subscription
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

  const handleSendSystemMessage = async (message: string, type: 'system' | 'announcement' = 'system') => {
    const messageText = message.trim();
    if (!messageText) return;

    // Create optimistic message for immediate display
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`, // Temporary ID
      roomId: room.id,
      userId: currentUserId,
      message: messageText,
      messageType: type,
      createdAt: new Date().toISOString(),
      user: undefined // System/announcement messages don't need user data
    };

    // Add message to UI immediately (optimistic update)
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    try {
      // Send to database
      const result = await chatService.sendMessage({
        room_id: room.id,
        user_id: currentUserId,
        message: messageText,
        message_type: type
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
                  user: undefined
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to send system message:', error);
      // Remove optimistic message on error
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== optimisticMessage.id)
      );
    }
  };

  const handleQuickAnnouncement = async (message: string) => {
    await handleSendSystemMessage(message, 'announcement');
  };

  const handleMessageSelect = (messageId: string) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
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
        await supabase
          .from('chat_messages')
          .delete()
          .eq('id', messageId);
      }

      // Remove from local state
      setMessages(prev => prev.filter(msg => !messageIds.includes(msg.id)));
      setSelectedMessages(prev => prev.filter(id => !messageIds.includes(id)));

      // Exit selection mode if no messages selected
      if (selectedMessages.filter(id => !messageIds.includes(id)).length === 0) {
        setIsSelectionMode(false);
      }
    } catch (error) {
      console.error('Failed to delete messages:', error);
      alert('Failed to delete messages. Please try again.');
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      // Update message in database
      const { data, error } = await supabase
        .from('chat_messages')
        .update({ message: newContent })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, message: newContent }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to edit message:', error);
      alert('Failed to edit message. Please try again.');
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    if (isSelectionMode) {
      setSelectedMessages([]);
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{onlineUsers} online</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectionMode}
              className={`flex items-center space-x-1 ${
                isSelectionMode ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              {isSelectionMode ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Done</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Select</span>
                </>
              )}
            </Button>
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendSystemMessage('Please follow academic integrity guidelines during quiz discussions.')}
                  className="flex items-center space-x-1"
                >
                  <Shield className="w-4 h-4" />
                  <span>Integrity</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAnnouncement('🚨 Quiz is now available! Good luck to all participants.')}
                  className="flex items-center space-x-1 bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                >
                  <Bell className="w-4 h-4" />
                  <span>Quiz Available</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAnnouncement('⏰ Quiz will start in 5 minutes. Please be ready!')}
                  className="flex items-center space-x-1 bg-blue-50 border-blue-200 hover:bg-blue-100"
                >
                  <Bell className="w-4 h-4" />
                  <span>Starting Soon</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAnnouncement('✅ Quiz has ended. Results will be available shortly.')}
                  className="flex items-center space-x-1 bg-green-50 border-green-200 hover:bg-green-100"
                >
                  <Bell className="w-4 h-4" />
                  <span>Quiz Ended</span>
                </Button>
              </div>
            )}
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
            selectedMessages={selectedMessages}
            onMessageSelect={handleMessageSelect}
            onDeleteMessages={handleDeleteMessages}
            onEditMessage={handleEditMessage}
            isSelectionMode={isSelectionMode}
            isAdmin={isAdmin}
          />
        </div>

        <div className="flex-shrink-0 mt-4">
          <MessageInput
            onSendMessage={handleSendMessage}
            placeholder={`Message ${room.name}...`}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
};