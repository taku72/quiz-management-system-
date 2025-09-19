'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoginForm } from '@/components/LoginForm';
import {
  BookOpen,
  Users,
  BarChart3,
  MessageSquare,
  CheckCircle,
  Star,
  ArrowRight,
  Shield,
  Clock,
  Award
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = React.useState(false);

  if (showLogin) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QuizMaster</h1>
                <p className="text-sm text-gray-500">Professional Quiz Management System</p>
              </div>
            </div>
            <Button onClick={() => setShowLogin(true)} className="flex items-center space-x-2">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
              Transform Learning with
              <span className="block text-blue-600">Smart Quiz Management</span>
            </h2>
            <p className="max-w-3xl mx-auto mb-8 text-xl text-gray-600">
              Create, manage, and analyze quizzes with our comprehensive platform.
              Perfect for educational institutions, corporate training, and assessment centers.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                onClick={() => setShowLogin(true)}
                size="lg"
                className="flex items-center px-8 py-4 space-x-2 text-lg"
              >
                <span>Start Your Quiz Journey</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute w-20 h-20 bg-blue-200 rounded-full top-10 left-10 opacity-20"></div>
        <div className="absolute w-16 h-16 bg-purple-200 rounded-full top-40 right-20 opacity-20"></div>
        <div className="absolute w-12 h-12 bg-green-200 rounded-full bottom-20 left-1/4 opacity-20"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h3 className="mb-4 text-3xl font-bold text-gray-900">Powerful Features</h3>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Everything you need to create engaging quizzes and track student progress
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-shadow border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Quiz Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create comprehensive quizzes with multiple question types, time limits, and passing scores.
                  Support for images, code snippets, and rich formatting.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-shadow border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Manage student registrations with approval workflows. Track progress,
                  view attempt history, and generate detailed performance reports.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-shadow border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Analytics & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Comprehensive analytics dashboard with quiz performance metrics,
                  student progress tracking, and detailed reporting capabilities.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-shadow border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-orange-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Real-time Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Interactive chat rooms for quiz discussions, study groups, and
                  collaborative learning. Connect students and educators instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-shadow border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-red-100 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Enterprise-grade security with role-based access control,
                  data encryption, and comprehensive audit trails.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-shadow border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-teal-100 rounded-lg">
                  <Award className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Certification Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Generate certificates for completed quizzes. Perfect for training
                  programs, certifications, and academic assessments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-blue-600">1000+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-green-600">500+</div>
              <div className="text-gray-600">Quizzes Created</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-purple-600">95%</div>
              <div className="text-gray-600">Pass Rate</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h3 className="mb-4 text-3xl font-bold text-white">
            Ready to Transform Your Assessment Process?
          </h3>
          <p className="mb-8 text-xl text-blue-100">
            Join thousands of educators and organizations using QuizMaster to deliver
            engaging assessments and track student success.
          </p>
          <Button
            onClick={() => setShowLogin(true)}
            size="lg"
            className="px-8 py-4 text-lg text-blue-600 bg-white hover:bg-gray-50"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-white bg-gray-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4 space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">QuizMaster</span>
              </div>
              <p className="mb-4 text-gray-400">
                Empowering education through innovative quiz management solutions.
              </p>
              <p className="text-sm text-gray-500">
                © 2024 QuizMaster. All rights reserved.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="transition-colors hover:text-white">Features</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Pricing</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Security</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="transition-colors hover:text-white">Documentation</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Help Center</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Contact Us</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};