'use client';

import React, { useState, useEffect } from 'react';
import { quizService } from '@/lib/database';
import { quizzes } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Eye, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { CreateQuizForm } from './CreateQuizForm';

export const QuizList: React.FC = () => {
   const [quizList, setQuizList] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [previewQuiz, setPreviewQuiz] = useState<any>(null);
   const [editingQuiz, setEditingQuiz] = useState<any>(null);

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

  const handlePreview = (quiz: any) => {
    setPreviewQuiz(quiz);
  };

  const handleEdit = (quiz: any) => {
    setEditingQuiz(quiz);
  };

  const handleEditSuccess = () => {
    setEditingQuiz(null);
    loadQuizzes(); // Reload the quiz list
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
                      onClick={() => handlePreview(quiz)}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                      onClick={() => handleEdit(quiz)}
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

      {/* Preview Modal */}
      {previewQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Preview: {previewQuiz.title}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewQuiz(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Quiz Details</h4>
                  <p className="text-gray-600">{previewQuiz.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    Passing Score: {previewQuiz.passingScore}% | Questions: {previewQuiz.questions.length}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Questions</h4>
                  {previewQuiz.questions.map((question: any, index: number) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Question {index + 1}: {question.question}
                      </h5>
                      <div className="text-sm text-gray-600 mb-2">
                        Type: {question.type} | Points: {question.points}
                      </div>

                      {question.type === 'multiple-choice' && question.options && (
                        <div className="space-y-1">
                          {question.options.map((option: string, optIndex: number) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <span className={`w-4 h-4 rounded-full border-2 ${
                                optIndex === question.correctAnswer
                                  ? 'border-green-500 bg-green-100'
                                  : 'border-gray-300'
                              }`}></span>
                              <span className={optIndex === question.correctAnswer ? 'font-medium text-green-700' : ''}>
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === 'true-false' && (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`w-4 h-4 rounded-full border-2 ${
                              question.correctAnswer === true
                                ? 'border-green-500 bg-green-100'
                                : 'border-gray-300'
                            }`}></span>
                            <span className={question.correctAnswer === true ? 'font-medium text-green-700' : ''}>
                              True
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`w-4 h-4 rounded-full border-2 ${
                              question.correctAnswer === false
                                ? 'border-green-500 bg-green-100'
                                : 'border-gray-300'
                            }`}></span>
                            <span className={question.correctAnswer === false ? 'font-medium text-green-700' : ''}>
                              False
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Edit Quiz: {editingQuiz.title}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingQuiz(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CreateQuizForm
                quiz={editingQuiz}
                onSuccess={handleEditSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
