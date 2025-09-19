'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SignUpForm } from '@/components/SignUpForm';
import { LogIn, User, Lock } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  if (showSignUp) {
    return <SignUpForm onBackToLogin={() => setShowSignUp(false)} />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(username, password);
    if (!result.success) {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen px-4"
      style={{
        backgroundImage: 'url(/images/quiz-background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full">
              <LogIn className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Quiz Management System</CardTitle>
            <p className="mt-2 text-gray-600">Sign in to your account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute w-4 h-4 text-gray-400 left-3 top-9" />
                <Input
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              
              <div className="relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
                <Lock className="absolute z-10 w-4 h-4 text-gray-400 left-3 top-8" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full px-3 py-2 pl-10 text-gray-900 placeholder-gray-400 transition-colors bg-white border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>

              {error && (
                <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="mb-3 text-sm text-gray-600">
                  Don&apos;t have an account?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSignUp(true)}
                  className="w-full"
                  disabled={isLoading}
                >
                  Create New Account
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};
