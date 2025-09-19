'use client';

import React, { useState, useEffect } from 'react';
import { quizzes, quizAttempts, users } from '@/lib/data';
import { quizAttemptService } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BarChart3, Download, Filter } from 'lucide-react';

export const QuizResults: React.FC = () => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>('all');
  const [dbAttempts, setDbAttempts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const attempts = await quizAttemptService.getAllAttempts();
      if (attempts && attempts.length > 0) {
        setDbAttempts(attempts);
      }
    } catch (error) {
      console.log('Failed to load attempts from database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Combine database and mock data attempts
  const allAttempts = [...dbAttempts, ...quizAttempts];
  const filteredAttempts = selectedQuizId === 'all' 
    ? allAttempts 
    : allAttempts.filter(attempt => 
        (attempt.quizId === selectedQuizId) || (attempt.quiz_id === selectedQuizId)
      );

  const getQuizTitle = (quizId: string) => {
    return quizzes.find(q => q.id === quizId)?.title || 'Unknown Quiz';
  };

  const getStudentName = (studentId: string) => {
    const user = users.find(u => u.id === studentId);
    return user?.name || user?.username || 'Unknown Student';
  };

  const calculateStats = () => {
    if (filteredAttempts.length === 0) return { avgScore: 0, passRate: 0, totalAttempts: 0 };
    
    const avgScore = Math.round(
      filteredAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / filteredAttempts.length
    );
    const passedAttempts = filteredAttempts.filter(attempt => attempt.passed).length;
    const passRate = Math.round((passedAttempts / filteredAttempts.length) * 100);
    
    return { avgScore, passRate, totalAttempts: filteredAttempts.length };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quiz Results</h2>
          <p className="text-gray-600">Monitor student performance and quiz analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Quizzes</option>
            {quizzes.map(quiz => (
              <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAttempts}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgScore}%</p>
              </div>
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                <span className="font-bold text-orange-600">%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.passRate}%</p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                stats.passRate >= 70 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  stats.passRate >= 70 ? 'bg-green-600' : 'bg-red-600'
                }`}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAttempts.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No quiz attempts found</p>
              <p className="text-sm">Results will appear here once students start taking quizzes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Quiz
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Result
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Time Spent
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Completed At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttempts
                    .sort((a, b) => new Date(b.completed_at || b.completedAt).getTime() - new Date(a.completed_at || a.completedAt).getTime())
                    .map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {attempt.users?.username || getStudentName(attempt.studentId || attempt.user_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {attempt.quizzes?.title || getQuizTitle(attempt.quizId || attempt.quiz_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{attempt.score}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attempt.passed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {attempt.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {attempt.time_taken ? 
                          `${Math.floor(attempt.time_taken / 60)}m ${attempt.time_taken % 60}s` :
                          `${Math.floor((attempt.timeSpent || 0) / 60)}m ${(attempt.timeSpent || 0) % 60}s`
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(attempt.completed_at || attempt.completedAt).toLocaleDateString()} {new Date(attempt.completed_at || attempt.completedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
