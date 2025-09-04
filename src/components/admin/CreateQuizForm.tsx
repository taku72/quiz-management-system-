'use client';

import React, { useState } from 'react';
import { addQuiz } from '@/lib/data';
import { quizService } from '@/lib/database';
import { Quiz, Question } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Trash2, Save } from 'lucide-react';

interface CreateQuizFormProps {
  onSuccess: () => void;
}

export const CreateQuizForm: React.FC<CreateQuizFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(60);
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addQuestion = (type: 'multiple-choice' | 'true-false') => {
    const newQuestion: Omit<Question, 'id'> = {
      type,
      question: '',
      correctAnswer: type === 'multiple-choice' ? 0 : false,
      points: 10,
      ...(type === 'multiple-choice' && { options: ['', '', '', ''] })
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    (updatedQuestions[index] as any)[field] = value;
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options![optionIndex] = value;
      setQuestions(updatedQuestions);
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (passingScore < 0 || passingScore > 100) newErrors.passingScore = 'Passing score must be between 0 and 100';
    if (questions.length === 0) newErrors.questions = 'At least one question is required';

    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`question_${index}`] = 'Question text is required';
      }
      if (question.type === 'multiple-choice' && question.options) {
        const filledOptions = question.options.filter(opt => opt.trim());
        if (filledOptions.length < 2) {
          newErrors[`question_${index}_options`] = 'At least 2 options are required';
        }
      }
      if (question.points <= 0) {
        newErrors[`question_${index}_points`] = 'Points must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const newQuiz: Quiz = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      questions: questions.map((q, index) => ({
        ...q,
        id: `${Date.now()}_${index}`,
        question: q.question.trim()
      })),
      passingScore,
      createdBy: '1', // Admin ID
      createdAt: new Date().toISOString(),
      isActive: true
    };

    try {
      // Try to save to database first
      await quizService.createQuiz({
        title: newQuiz.title,
        description: newQuiz.description,
        questions: newQuiz.questions,
        time_limit: Math.ceil(newQuiz.questions.length * 1.5), // Estimated time in minutes
        passing_score: newQuiz.passingScore,
        created_by: '332f2cb8-74b1-4a97-92b3-3215879042e2' // Use actual user ID from database
      });
      console.log('Quiz saved to database successfully');
    } catch (error) {
      console.log('Database save failed, using local storage:', error);
      // Fallback to local storage
      addQuiz(newQuiz);
    }
    
    // Reset form
    setTitle('');
    setDescription('');
    setPassingScore(60);
    setQuestions([]);
    setErrors({});
    
    onSuccess();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Create New Quiz</h2>
        <p className="text-gray-600">Build a comprehensive quiz for your students</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Quiz Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              error={errors.title}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quiz description"
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>

            <Input
              label="Passing Score (%)"
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              min="0"
              max="100"
              error={errors.passingScore}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Questions ({questions.length})</CardTitle>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion('multiple-choice')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Multiple Choice
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion('true-false')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  True/False
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {errors.questions && (
              <p className="text-sm text-red-600 mb-4">{errors.questions}</p>
            )}
            
            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No questions added yet. Click the buttons above to add questions.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Question {questionIndex + 1} ({question.type})
                      </h4>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Input
                          label="Question Text"
                          value={question.question}
                          onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                          placeholder="Enter your question"
                          error={errors[`question_${questionIndex}`]}
                        />
                      </div>

                      {question.type === 'multiple-choice' && question.options && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Answer Options
                          </label>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name={`correct_${questionIndex}`}
                                  checked={question.correctAnswer === optionIndex}
                                  onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                                  className="text-blue-600"
                                />
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                          </div>
                          {errors[`question_${questionIndex}_options`] && (
                            <p className="text-sm text-red-600 mt-1">{errors[`question_${questionIndex}_options`]}</p>
                          )}
                        </div>
                      )}

                      {question.type === 'true-false' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correct Answer
                          </label>
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`tf_${questionIndex}`}
                                checked={question.correctAnswer === true}
                                onChange={() => updateQuestion(questionIndex, 'correctAnswer', true)}
                                className="text-blue-600 mr-2"
                              />
                              True
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`tf_${questionIndex}`}
                                checked={question.correctAnswer === false}
                                onChange={() => updateQuestion(questionIndex, 'correctAnswer', false)}
                                className="text-blue-600 mr-2"
                              />
                              False
                            </label>
                          </div>
                        </div>
                      )}

                      <Input
                        label="Points"
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(questionIndex, 'points', Number(e.target.value))}
                        min="1"
                        error={errors[`question_${questionIndex}_points`]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Create Quiz</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
