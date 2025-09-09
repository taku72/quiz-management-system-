'use client';

import React, { useState } from 'react';
import { ChatMessage } from '@/types';
import { Button } from '@/components/ui/Button';
import { Trash2, X, Edit3, Check, RotateCcw } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  currentUserId: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  selectedMessages?: string[];
  onMessageSelect?: (messageId: string) => void;
  onDeleteMessages?: (messageIds: string[]) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  isSelectionMode?: boolean;
  isAdmin?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  currentUserId,
  messagesEndRef,
  selectedMessages = [],
  onMessageSelect,
  onDeleteMessages,
  onEditMessage,
  isSelectionMode = false,
  isAdmin = false
}) => {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p>No messages yet.</p>
          <p className="text-sm">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  const canDeleteMessage = (message: ChatMessage) => {
    // Users can delete their own messages, admins can delete any message
    return message.userId === currentUserId || isAdmin;
  };

  const canEditMessage = (message: ChatMessage) => {
    // Only message senders can edit their own messages
    // Cannot edit system messages or announcements
    return message.userId === currentUserId && message.messageType === 'text';
  };

  const startEditing = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditContent(message.message);
  };

  const saveEdit = () => {
    if (editingMessageId && editContent.trim()) {
      onEditMessage?.(editingMessageId, editContent.trim());
      setEditingMessageId(null);
      setEditContent('');
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto p-4">
      {isSelectionMode && selectedMessages.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-800">
            {selectedMessages.length} message{selectedMessages.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteMessages?.(selectedMessages)}
              className="flex items-center space-x-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Clear selection
                selectedMessages.forEach(id => onMessageSelect?.(id));
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {messages.map((message) => {
        const isSelected = selectedMessages.includes(message.id);
        const isOwnMessage = message.userId === currentUserId;
        const isEditing = editingMessageId === message.id;

        return (
          <div
            key={message.id}
            className={`flex ${
              message.userId === currentUserId ? 'justify-end' : 'justify-start'
            } ${isSelectionMode ? 'cursor-pointer' : ''}`}
            onClick={() => {
              if (isSelectionMode && canDeleteMessage(message)) {
                onMessageSelect?.(message.id);
              }
            }}
          >
            <div className="flex items-start space-x-2">
              {isSelectionMode && canDeleteMessage(message) && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onMessageSelect?.(message.id)}
                  className="mt-1"
                />
              )}

              {!isSelectionMode && !isEditing && (canEditMessage(message) || canDeleteMessage(message)) && (
                <div className="flex flex-col space-y-1 mt-1">
                  {canEditMessage(message) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(message);
                      }}
                      className="p-1 h-6 w-6"
                      title="Edit message"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  )}
                  {canDeleteMessage(message) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this message?')) {
                          onDeleteMessages?.([message.id]);
                        }
                      }}
                      className="p-1 h-6 w-6 text-red-600 hover:bg-red-50"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}

              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                } ${
                  message.userId === currentUserId
                    ? 'bg-blue-500 text-white'
                    : message.messageType === 'system'
                    ? 'bg-gray-100 text-gray-600 text-center'
                    : message.messageType === 'announcement'
                    ? 'bg-yellow-100 text-yellow-800 text-center'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white text-gray-900 border-2 border-blue-300 rounded-md resize-none shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                      rows={Math.min(Math.max(editContent.split('\n').length, 2), 5)}
                      autoFocus
                      placeholder="Edit your message..."
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                        className="h-6 px-2"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={saveEdit}
                        className="h-6 px-2"
                        disabled={!editContent.trim()}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : message.messageType === 'system' || message.messageType === 'announcement' ? (
                  <div className="text-sm font-medium">
                    {message.message}
                  </div>
                ) : (
                  <>
                    <div className="text-sm">
                      {message.message}
                    </div>
                    <div className={`text-xs mt-1 ${
                      message.userId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.user?.username || 'Unknown'} • {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};