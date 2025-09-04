'use client';

import React from 'react';
import { getQuizAttemptsByStudent, quizzes } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';

export const StudentHistory: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const attempts = getQuizAttemptsByStudent(user.id);
  const sortedAttempts = attempts.sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  const getQuizTitle = (quizId: string) => {
    return quizzes.find(q => q.id === quizId)?.title || 'Unknown Quiz';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Quiz History</h2>
        <p className="text-sm text-gray-600">{attempts.length} total attempts</p>
      </div>

      {attempts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quiz attempts yet</h3>
            <p className="text-gray-600">Start taking quizzes to see your history here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAttempts.map((attempt) => (
            <Card key={attempt.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {getQuizTitle(attempt.quizId)}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        attempt.passed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {attempt.passed ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Passed
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                          </>
                        )}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{attempt.score}%</p>
                        <p className="text-sm text-blue-800">Score</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{formatTime(attempt.timeSpent)}</p>
                        <p className="text-sm text-purple-800">Time Taken</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-600">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-800">Date</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">
                          {new Date(attempt.completedAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        <p className="text-sm text-orange-800">Time</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Attempt ID: {attempt.id}</span>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Completed {new Date(attempt.completedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
