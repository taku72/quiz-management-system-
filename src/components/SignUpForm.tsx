'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserPlus, User, Lock, Mail, ArrowLeft, Check, X } from 'lucide-react';
import { validatePassword, getPasswordStrengthText, getPasswordStrengthColor } from '@/utils/passwordValidation';

interface SignUpFormProps {
  onBackToLogin: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordStrength = validatePassword(formData.password);
      if (!passwordStrength.isValid) {
        newErrors.password = 'Password must contain at least 8 characters with uppercase, lowercase, numbers, and symbols';
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const success = await register({
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'student'
      });

      if (success) {
        setRegistrationSuccess(true);
      } else {
        setErrors({ submit: 'Registration failed. Username or email may already exist.' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message for student registrations
  if (registrationSuccess) {
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
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Registration Submitted</CardTitle>
              <p className="mt-2 text-gray-600">Your account is pending approval</p>
            </CardHeader>
            <CardContent>
              <div className="px-4 py-3 mb-6 text-sm text-green-700 border border-green-200 rounded-md bg-green-50">
                <p className="mb-2 font-medium">Registration Successful!</p>
                <p>Your student account has been submitted for admin approval. You will be able to log in once an administrator approves your registration.</p>
              </div>

              <Button
                variant="outline"
                onClick={onBackToLogin}
                className="flex items-center justify-center w-full space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Content */}
      <div className="relative z-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
            <UserPlus className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="mt-2 text-gray-600">Join the Quiz Management System</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute z-10 w-4 h-4 text-gray-500 left-3 top-9" />
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="pl-10 text-base font-medium"
                disabled={isLoading}
                error={errors.name}
              />
            </div>

            <div className="relative">
              <User className="absolute z-10 w-4 h-4 text-gray-500 left-3 top-9" />
              <Input
                label="Username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Choose a username"
                className="pl-10 text-base font-medium"
                disabled={isLoading}
                error={errors.username}
              />
            </div>

            <div className="relative">
              <Mail className="absolute z-10 w-4 h-4 text-gray-500 left-3 top-9" />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="pl-10 text-base font-medium"
                disabled={isLoading}
                error={errors.email}
              />
            </div>



            <div className="relative">
              <Lock className="absolute z-10 w-4 h-4 text-gray-500 left-3 top-9" />
              <Input
                label="Password"
                type="text"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a strong password"
                className="pl-10 text-base font-medium"
                disabled={isLoading}
                error={errors.password}
              />
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-2">
                  {(() => {
                    const strength = validatePassword(formData.password);
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Password Strength:</span>
                          <span className={`text-sm font-medium ${getPasswordStrengthColor(strength)}`}>
                            {getPasswordStrengthText(strength)}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              strength.score === 5 ? 'bg-green-500' :
                              strength.score === 4 ? 'bg-green-400' :
                              strength.score === 3 ? 'bg-yellow-500' :
                              strength.score === 2 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(strength.score / 5) * 100}%` }}
                          ></div>
                        </div>
                        
                        {/* Requirements Checklist */}
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          <div className={`flex items-center space-x-2 ${strength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                            {strength.hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>At least 8 characters</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${strength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                            {strength.hasUpperCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>Uppercase letter (A-Z)</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${strength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                            {strength.hasLowerCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>Lowercase letter (a-z)</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${strength.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                            {strength.hasNumbers ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>Number (0-9)</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${strength.hasSymbols ? 'text-green-600' : 'text-gray-500'}`}>
                            {strength.hasSymbols ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>Symbol (!@#$%^&*)</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute z-10 w-4 h-4 text-gray-500 left-3 top-9" />
              <Input
                label="Confirm Password"
                type="text"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                className="pl-10 text-base font-medium"
                disabled={isLoading}
                error={errors.confirmPassword}
              />
            </div>

            {errors.submit && (
              <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">
                {errors.submit}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="pt-6 mt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onBackToLogin}
              className="flex items-center justify-center w-full space-x-2"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
