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
    <Card className="overflow-hidden group transition-all hover:shadow-lg border border-gray-200">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{quiz.title}</CardTitle>
            <p className="opacity-90 text-sm mt-1 line-clamp-2">{quiz.description}</p>
          </div>
          {isNew && (
            <span className="ml-3 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-white/15 text-white border border-white/20">
              <Flame className="w-3 h-3" /> New
            </span>
          )}
        </div>
      </div>

      <CardContent className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="rounded-md bg-blue-50 text-blue-800 p-3">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4" /> Questions
            </div>
            <p className="text-2xl font-bold">{questionCount}</p>
          </div>
          <div className="rounded-md bg-green-50 text-green-800 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" /> Pass
            </div>
            <p className="text-2xl font-bold">{passScore}%</p>
          </div>
          <div className="rounded-md bg-purple-50 text-purple-800 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4" /> Points
            </div>
            <p className="text-2xl font-bold">{totalPoints}</p>
          </div>
          <div className="rounded-md bg-amber-50 text-amber-800 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" /> Time
            </div>
            <p className="text-2xl font-bold">{estimatedMinutes}m</p>
          </div>
        </div>

        {hasAttempted && lastAttempt && (
          <div className="mb-4 p-3 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700 flex items-center justify-between">
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

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">By: {quiz.createdBy ?? quiz.created_by ?? "—"}</div>
          {passed ? (
            <div className="inline-flex items-center gap-2 text-green-600">
              <Trophy className="w-4 h-4" />
              <span className="font-medium">Completed</span>
            </div>
          ) : (
            <Button onClick={onStart} className="group/button">
              <BookOpen className="w-4 h-4 mr-2 group-hover/button:scale-110 transition-transform" />
              {hasAttempted ? "Retake Quiz" : "Start Quiz"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};