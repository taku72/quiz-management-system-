'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chart } from '@/components/ui/Chart';
import { analyticsService } from '@/lib/database';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Target,
  Clock,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  quizStats: Array<{
    title: string;
    totalAttempts: number;
    passedAttempts: number;
    averageScore: number;
    passRate: number;
    scores: number[];
  }>;
  userStats: Array<{
    username: string;
    totalAttempts: number;
    passedAttempts: number;
    averageScore: number;
    passRate: number;
    scores: number[];
  }>;
  questionStats: Array<{
    quizId: string;
    questionIndex: number;
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
    difficulty: number;
  }>;
  timeStats: Array<{
    date: string;
    score: number;
    timeTaken: number;
  }>;
  totalAttempts: number;
}

export const QuizAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  const loadAnalytics = async () => {
    try {
      setRefreshing(true);
      const [analytics, trends] = await Promise.all([
        analyticsService.getQuizPerformanceAnalytics(),
        analyticsService.getQuizTrends(parseInt(timeRange))
      ]);

      setAnalyticsData(analytics);
      setTrendsData(trends);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Analytics Data Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Analytics will appear once students start taking quizzes.
        </p>
      </div>
    );
  }

  // Prepare chart data
  const quizPerformanceData = analyticsData.quizStats.map(stat => ({
    label: stat.title.length > 15 ? stat.title.substring(0, 15) + '...' : stat.title,
    value: Math.round(stat.averageScore),
    color: '#3b82f6'
  }));

  const passRateData = analyticsData.quizStats.map(stat => ({
    label: stat.title.length > 15 ? stat.title.substring(0, 15) + '...' : stat.title,
    value: Math.round(stat.passRate),
    color: stat.passRate >= 70 ? '#10b981' : stat.passRate >= 50 ? '#f59e0b' : '#ef4444'
  }));

  const trendsChartData = trendsData.map(day => ({
    label: new Date(day.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    value: Math.round(day.averageScore),
    color: '#3b82f6'
  }));

  const questionDifficultyData = analyticsData.questionStats
    .sort((a, b) => b.difficulty - a.difficulty)
    .slice(0, 10)
    .map(stat => ({
      label: `Q${stat.questionIndex + 1}`,
      value: Math.round(stat.difficulty),
      color: stat.difficulty > 70 ? '#ef4444' : stat.difficulty > 50 ? '#f59e0b' : '#10b981'
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quiz Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into quiz performance and student progress
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7' | '30' | '90')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button
            variant="outline"
            onClick={loadAnalytics}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Quiz Attempts
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analyticsData.totalAttempts}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analyticsData.quizStats.length > 0
                    ? Math.round(analyticsData.quizStats.reduce((sum, stat) => sum + stat.averageScore, 0) / analyticsData.quizStats.length)
                    : 0}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overall Pass Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analyticsData.quizStats.length > 0
                    ? Math.round(analyticsData.quizStats.reduce((sum, stat) => sum + stat.passRate, 0) / analyticsData.quizStats.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Students
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analyticsData.userStats.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Quiz Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              data={quizPerformanceData}
              type="bar"
              width={400}
              height={250}
            />
          </CardContent>
        </Card>

        {/* Pass Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Pass Rates by Quiz</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              data={passRateData}
              type="bar"
              width={400}
              height={250}
            />
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Performance Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              data={trendsChartData}
              type="line"
              width={400}
              height={250}
            />
          </CardContent>
        </Card>

        {/* Question Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Question Difficulty Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questionDifficultyData.length > 0 ? (
              <Chart
                data={questionDifficultyData}
                type="bar"
                width={400}
                height={250}
              />
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No question data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Students */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.userStats
                .sort((a, b) => b.averageScore - a.averageScore)
                .slice(0, 5)
                .map((user, index) => (
                  <div key={user.username} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.totalAttempts} attempts
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {Math.round(user.averageScore)}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(user.passRate)}% pass rate
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Quiz Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.quizStats.map((quiz) => (
                <div key={quiz.title} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {quiz.title}
                    </h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {quiz.totalAttempts} attempts
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Avg Score</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {Math.round(quiz.averageScore)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Pass Rate</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {Math.round(quiz.passRate)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Passed</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {quiz.passedAttempts}/{quiz.totalAttempts}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};