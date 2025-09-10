'use client';

import React from 'react';

interface TypingUser {
  userId: string;
  username: string;
  timestamp: number;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  currentUserId: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  currentUserId
}) => {
  // Filter out current user and get users who are actively typing (within last 3 seconds)
  const activeTypingUsers = typingUsers.filter(user =>
    user.userId !== currentUserId &&
    Date.now() - user.timestamp < 3000
  );

  if (activeTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (activeTypingUsers.length === 1) {
      return `${activeTypingUsers[0].username} is typing...`;
    } else if (activeTypingUsers.length === 2) {
      return `${activeTypingUsers[0].username} and ${activeTypingUsers[1].username} are typing...`;
    } else {
      return `${activeTypingUsers[0].username} and ${activeTypingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 italic">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
};