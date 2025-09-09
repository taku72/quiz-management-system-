'use client';

import React, { useState, useEffect } from 'react';
import { chatService } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { ChatRoom as ChatRoomType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Users, Plus } from 'lucide-react';

interface ChatRoomListProps {
  onRoomSelect: (room: ChatRoomType) => void;
  selectedRoomId?: string;
  currentUserId: string;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
  onRoomSelect,
  selectedRoomId,
  currentUserId
}) => {
  const [rooms, setRooms] = useState<ChatRoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  // Real-time subscription for new chat rooms
  useEffect(() => {
    const channel = supabase
      .channel('chat_rooms')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload: any) => {
          const newRoom = payload.new as ChatRoomType;
          setRooms(prevRooms => {
            // Check if room already exists to avoid duplicates
            if (prevRooms.some(room => room.id === newRoom.id)) {
              return prevRooms;
            }
            return [...prevRooms, newRoom];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const allRooms = await chatService.getAllActiveChatRooms();
      setRooms(allRooms);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudyGroup = async () => {
    console.log('Study Group button clicked');
    // This would open a modal to create a new study group
    // For now, we'll just refresh the list
    console.log('Refreshing chat rooms list');
    await loadRooms();
    console.log('Chat rooms refreshed');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Chat Rooms</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading rooms...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Chat Rooms</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateStudyGroup}
            className="flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Study Group</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rooms.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No chat rooms available</p>
            <p className="text-sm">Create a quiz to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRoomId === room.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onRoomSelect(room)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{room.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {room.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        room.type === 'quiz'
                          ? 'bg-blue-100 text-blue-800'
                          : room.type === 'study'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {room.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};