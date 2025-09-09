'use client';

import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt as QuizAttemptType } from '@/types';
import { addQuizAttempt } from '@/lib/data';
import { quizAttemptService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChatRoomSuggestion, ChatRoom } from '@/components/chat';
import { ArrowLeft, Clock, CheckCircle, XCircle, Award, X } from 'lucide-react';

interface QuizAttemptProps {
  quiz: Quiz;
  onComplete: () => void;
  onCancel: () => void;
}

export const QuizAttempt: React.FC<QuizAttemptProps> = ({ quiz, onComplete, onCancel }) => {
   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
   const [answers, setAnswers] = useState<(string | number | boolean)[]>([]);
   const [startTime] = useState(Date.now());
   const [timeElapsed, setTimeElapsed] = useState(0);
   const [isSubmitted, setIsSubmitted] = useState(false);
   const [results, setResults] = useState<{ score: number; passed: boolean; correctAnswers: boolean[] } | null>(null);
   const [showChatModal, setShowChatModal] = useState(false);
   const [selectedChatRoom, setSelectedChatRoom] = useState<any>(null);
   const { user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const hasAnswered = answers[currentQuestionIndex] !== undefined;

  const handleAnswer = (answer: string | number | boolean) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateResults = () => {
    let correctCount = 0;
    const correctAnswers: boolean[] = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      correctAnswers.push(isCorrect);
      if (isCorrect) correctCount++;
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = quiz.questions.reduce((sum, q, index) => {
      return sum + (correctAnswers[index] ? q.points : 0);
    }, 0);

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= 50; // Pass if score is 50% or higher

    return { score, passed, correctAnswers };
  };

  const handleSubmit = async () => {
    if (!user) return;

    const results = calculateResults();
    setResults(results);
    setIsSubmitted(true);

    const attempt: QuizAttemptType = {
      id: Date.now().toString(),
      quizId: quiz.id,
      studentId: user.id,
      answers,
      score: results.score,
      passed: results.passed,
      completedAt: new Date().toISOString(),
      timeSpent: timeElapsed
    };

    try {
      // Save to database first
      await quizAttemptService.createAttempt({
        quiz_id: quiz.id,
        user_id: user.id,
        answers: answers,
        score: results.score,
        time_taken: timeElapsed,
        passed: results.passed
      });
      console.log('Quiz attempt saved to database successfully');
    } catch (error) {
      console.log('Database save failed, using local storage:', error);
    }

    // Always save to local storage as fallback
    addQuizAttempt(attempt);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleJoinChatRoom = (room: any) => {
    setSelectedChatRoom(room);
    setShowChatModal(true);
  };

  const handleCloseChatModal = () => {
    setShowChatModal(false);
    setSelectedChatRoom(null);
  };

  if (isSubmitted && results) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              results.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {results.passed ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {results.passed ? 'Congratulations!' : 'Quiz Complete'}
            </CardTitle>
            <p className="text-gray-600">
              {results.passed 
                ? 'You have successfully passed the quiz!' 
                : 'You did not meet the passing criteria this time.'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{results.score}%</p>
                <p className="text-sm text-blue-800">Your Score</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{quiz.passingScore}%</p>
                <p className="text-sm text-green-800">Required</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{formatTime(timeElapsed)}</p>
                <p className="text-sm text-purple-800">Time Taken</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Question Review</h3>
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                    {results.correctAnswers[index] ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{question.question}</p>
                  
                  {question.type === 'multiple-choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const isUserAnswer = answers[index] === optionIndex;
                        const isCorrectAnswer = question.correctAnswer === optionIndex;
                        
                        return (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded border ${
                              isCorrectAnswer
                                ? 'bg-green-50 border-green-200'
                                : isUserAnswer
                                ? 'bg-red-50 border-red-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <span className="text-sm">
                              {option}
                              {isCorrectAnswer && ' ✓'}
                              {isUserAnswer && !isCorrectAnswer && ' (Your answer)'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {question.type === 'true-false' && (
                    <div className="space-y-2">
                      {[true, false].map((value) => {
                        const isUserAnswer = answers[index] === value;
                        const isCorrectAnswer = question.correctAnswer === value;
                        
                        return (
                          <div
                            key={value.toString()}
                            className={`p-2 rounded border ${
                              isCorrectAnswer
                                ? 'bg-green-50 border-green-200'
                                : isUserAnswer
                                ? 'bg-red-50 border-red-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <span className="text-sm">
                              {value ? 'True' : 'False'}
                              {isCorrectAnswer && ' ✓'}
                              {isUserAnswer && !isCorrectAnswer && ' (Your answer)'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button onClick={onComplete} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Chat Modal */}
      {showChatModal && selectedChatRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedChatRoom.name}</h3>
              <Button variant="outline" size="sm" onClick={handleCloseChatModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 p-4">
              <ChatRoom
                room={selectedChatRoom}
                currentUserId={user?.id || ''}
                isAdmin={user?.role === 'admin'}
                onClose={handleCloseChatModal}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Quiz Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onCancel} className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Question {currentQuestionIndex + 1}
                </h3>
                <p className="text-gray-700 mb-6">{currentQuestion.question}</p>

                {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          answers[currentQuestionIndex] === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${currentQuestionIndex}`}
                          value={index}
                          checked={answers[currentQuestionIndex] === index}
                          onChange={() => handleAnswer(index)}
                          className="text-blue-600 mr-3"
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'true-false' && (
                  <div className="space-y-3">
                    {[
                      { value: true, label: 'True' },
                      { value: false, label: 'False' }
                    ].map(({ value, label }) => (
                      <label
                        key={label}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          answers[currentQuestionIndex] === value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${currentQuestionIndex}`}
                          value={label}
                          checked={answers[currentQuestionIndex] === value}
                          onChange={() => handleAnswer(value)}
                          className="text-blue-600 mr-3"
                        />
                        <span className="text-gray-900">{label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>

                <div className="text-sm text-gray-600">
                  Points: {currentQuestion.points}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!hasAnswered}
                  className="flex items-center space-x-2"
                >
                  {isLastQuestion ? (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Submit Quiz</span>
                    </>
                  ) : (
                    <span>Next</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Room Suggestion Sidebar */}
        <div className="lg:col-span-1">
          <ChatRoomSuggestion
            quizId={quiz.id}
            onJoinRoom={handleJoinChatRoom}
          />
        </div>
      </div>
    </div>
  );
};
