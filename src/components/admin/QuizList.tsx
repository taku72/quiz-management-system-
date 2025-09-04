'use client';

import React, { useState, useEffect } from 'react';
import { quizService } from '@/lib/database';
import { quizzes } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';

export const QuizList: React.FC = () => {
  const [quizList, setQuizList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const dbQuizzes = await quizService.getAllQuizzes();
      if (dbQuizzes && dbQuizzes.length > 0) {
        // Parse questions from JSON string to array
        const parsedQuizzes = dbQuizzes.map((quiz: any) => ({
          ...quiz,
          questions: typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions
        }));
        setQuizList(parsedQuizzes);
      } else {
        // Fallback to mock data
        setQuizList(quizzes);
      }
    } catch (error) {
      console.log('Database load failed, using mock data:', error);
      // Fallback to mock data
      setQuizList(quizzes);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (quizId: string) => {
    const quiz = quizList.find(q => q.id === quizId);
    if (quiz) {
      try {
        await quizService.toggleQuizActive(quizId, !quiz.is_active);
        setQuizList(quizList.map(q => 
          q.id === quizId ? { ...q, is_active: !q.is_active } : q
        ));
      } catch (error) {
        console.error('Error toggling quiz:', error);
      }
    }
  };

  const handleDelete = async (quizId: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizService.deleteQuiz(quizId);
        setQuizList(quizList.filter(q => q.id !== quizId));
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Quiz Management</h2>
        <p className="text-sm text-gray-600">{quizList.length} total quizzes</p>
      </div>

      {quizList.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first quiz</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {quizList.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        quiz.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {quiz.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{quiz.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{quiz.questions.length}</p>
                    <p className="text-sm text-blue-800">Questions</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{quiz.passingScore}%</p>
                    <p className="text-sm text-green-800">Passing Score</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0)}
                    </p>
                    <p className="text-sm text-purple-800">Total Points</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(quiz.id)}
                      className="flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(quiz.id)}
                    className="flex items-center space-x-2"
                  >
                    {quiz.isActive ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-green-600" />
                        <span>Deactivate</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-gray-400" />
                        <span>Activate</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                    <span>ID: {quiz.id}</span>
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
