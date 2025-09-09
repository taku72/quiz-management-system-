'use client';

import React, { useState, useEffect } from 'react';
import { chatService } from '@/lib/database';
import { ChatRoom as ChatRoomType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, ExternalLink } from 'lucide-react';

interface ChatRoomSuggestionProps {
  quizId: string;
  onJoinRoom: (room: ChatRoomType) => void;
}

export const ChatRoomSuggestion: React.FC<ChatRoomSuggestionProps> = ({
  quizId,
  onJoinRoom
}) => {
  const [chatRooms, setChatRooms] = useState<ChatRoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatRooms();
  }, [quizId]);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const rooms = await chatService.getChatRoomsByQuiz(quizId);
      setChatRooms(rooms);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Study Chat</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading chat rooms...</div>
        </CardContent>
      </Card>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Study Chat</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No study chat available</p>
            <p className="text-xs mt-1">Chat rooms will be created when you start taking quizzes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Study Chat</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Join the discussion to get help and share strategies!
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {chatRooms.map((room) => (
            <div
              key={room.id}
              className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{room.name}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                    {room.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onJoinRoom(room)}
                  className="flex items-center space-x-1 ml-2 flex-shrink-0"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Join</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> Use study chat to discuss quiz topics, ask questions, and collaborate with peers!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};