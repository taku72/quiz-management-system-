'use client';

import React, { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  roomId?: string;
  currentUserId?: string;
  username?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  placeholder = 'Type a message...',
  disabled = false,
  roomId,
  currentUserId,
  username
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendTypingEvent = async (typing: boolean) => {
    if (!roomId || !currentUserId || !username) return;

    try {
      const channel = supabase.channel(`typing:${roomId}`);
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: currentUserId,
          username: username,
          roomId: roomId,
          isTyping: typing,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to send typing event:', error);
    }
  };

  const startTyping = () => {
    if (isTyping) return;

    setIsTyping(true);
    sendTypingEvent(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (!isTyping) return;

    setIsTyping(false);
    sendTypingEvent(false);

    // Clear stop typing timeout
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      stopTyping(); // Stop typing when message is sent
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex space-x-2">
      <div className="flex-1">
        <textarea
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
          style={{ minHeight: '40px', maxHeight: '120px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
          }}
        />
      </div>
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="flex-shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
};