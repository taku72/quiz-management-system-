"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BookOpen, Clock, Trophy, Target, Flame } from "lucide-react";

interface StudentQuizCardProps {
  quiz: any; // Keep flexible due to mixed mock/DB shapes
  hasAttempted: boolean;
  lastAttempt?: {
    score: number;
    passed: boolean;
    completedAt: string;
  } | null;
  onStart: () => void;
}

// Helper to compute points and estimated time based on questions
const getQuizMeta = (quiz: any) => {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  const totalPoints = questions.reduce((sum: number, q: any) => sum + (q?.points || 0), 0);
  const estimatedMinutes = Math.max(5, Math.ceil(questions.length * 1.5));
  const passScore = quiz.passingScore ?? quiz.passing_score ?? 0;
  const createdAt = quiz.createdAt ?? quiz.created_at;
  const isNew = createdAt ? Date.now() - new Date(createdAt).getTime() < 3 * 24 * 60 * 60 * 1000 : false;
  return { totalPoints, estimatedMinutes, passScore, isNew, questionCount: questions.length };
};

export const StudentQuizCard: React.FC<StudentQuizCardProps> = ({ quiz, hasAttempted, lastAttempt, onStart }) => {
  const { totalPoints, estimatedMinutes, passScore, isNew, questionCount } = getQuizMeta(quiz);
  const passed = !!lastAttempt?.passed;

  return (
    <Card className="overflow-hidden transition-all border border-gray-200 group hover:shadow-lg">
      <div className="p-5 text-white bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{quiz.title}</CardTitle>
            <p className="mt-1 text-sm opacity-90 line-clamp-2">{quiz.description}</p>
          </div>
          {isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-1 ml-3 text-xs font-medium text-white border rounded-full bg-white/15 border-white/20">
              <Flame className="w-3 h-3" /> New
            </span>
          )}
        </div>
      </div>

      <CardContent className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4 md:grid-cols-4">
          <div className="p-3 text-blue-800 rounded-md bg-blue-50">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4" /> Questions
            </div>
            <p className="text-2xl font-bold">{questionCount}</p>
          </div>
          <div className="p-3 text-green-800 rounded-md bg-green-50">
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" /> Pass
            </div>
            <p className="text-2xl font-bold">{passScore}%</p>
          </div>
          <div className="p-3 text-purple-800 rounded-md bg-purple-50">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4" /> Points
            </div>
            <p className="text-2xl font-bold">{totalPoints}</p>
          </div>
          <div className="p-3 rounded-md bg-amber-50 text-amber-800">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" /> Time
            </div>
            <p className="text-2xl font-bold">{estimatedMinutes}m</p>
          </div>
        </div>

        {hasAttempted && lastAttempt && (
          <div className="flex items-center justify-between p-3 mb-4 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50">
            <span>
              Last attempt: <span className="font-medium">{lastAttempt.score}%</span> on {new Date(lastAttempt.completedAt).toLocaleDateString()}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              {passed ? "Passed" : "Failed"}
            </span>
          </div>
        )}

        <div className="flex items-center justify-end">
          {passed ? (
            <div className="inline-flex items-center gap-2 text-green-600">
              <Trophy className="w-4 h-4" />
              <span className="font-medium">Completed</span>
            </div>
          ) : (
            <Button onClick={onStart} className="group/button">
              <BookOpen className="w-4 h-4 mr-2 transition-transform group-hover/button:scale-110" />
              {hasAttempted ? "Retake Quiz" : "Start Quiz"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};