'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, RegisterData } from '@/types';
import { supabase } from '@/lib/supabase';
import { userService } from '@/lib/database';
import { users, addUser, findUserByUsername, findUserByEmail } from '@/lib/data';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is properly configured
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

    if (!isSupabaseConfigured) {
      // Use localStorage for mock authentication
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
      return;
    }

    // Check for existing Supabase session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userProfile = await userService.getUserById(session.user.id);
          if (userProfile) {
            setUser(userProfile);
            localStorage.setItem('currentUser', JSON.stringify(userProfile));
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
      
      setIsLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        localStorage.removeItem('currentUser');
      } else if (session?.user) {
        try {
          const userProfile = await userService.getUserById(session.user.id);
          if (userProfile) {
            setUser(userProfile);
            localStorage.setItem('currentUser', JSON.stringify(userProfile));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { username, password });
      
      // Always try mock data first for testing
      const foundUser = users.find((u: any) => u.username === username && u.password === password);
      
      if (foundUser) {
        console.log('Found user in mock data:', foundUser);
        const userWithoutPassword = { ...foundUser };
        delete (userWithoutPassword as any).password;
        setUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        setIsLoading(false);
        return true;
      }
      
      // Try database lookup
      try {
        const dbUser = await userService.getUserByUsername(username);
        console.log('Database user lookup result:', dbUser);
        
        if (dbUser && dbUser.password === password) {
          const userWithoutPassword = { ...dbUser };
          delete (userWithoutPassword as any).password;
          setUser(userWithoutPassword);
          localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
          setIsLoading(false);
          return true;
        }
      } catch (dbError) {
        console.log('Database lookup failed:', dbError);
      }
      
      console.log('Login failed - no matching user found');
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check if username or email already exists in database
      const existingByUsername = await userService.getUserByUsername(data.username);
      const existingByEmail = await userService.getUserByEmail(data.email);
      
      // Also check mock data for duplicates
      const mockUserByUsername = findUserByUsername(data.username);
      const mockUserByEmail = findUserByEmail(data.email);
      
      if (existingByUsername || existingByEmail || mockUserByUsername || mockUserByEmail) {
        setIsLoading(false);
        return false;
      }

      // Create user for mock data (since database doesn't store passwords)
      const newUser: User = {
        id: Date.now().toString(),
        username: data.username,
        password: data.password,
        email: data.email,
        role: data.role,
        name: data.name
      };

      try {
        // Save to database (with password)
        const dbUser = await userService.createUser({
          username: data.username,
          email: data.email,
          role: data.role,
          password: data.password
        });
        console.log('User saved to database:', dbUser);
        
        // Use database user data
        const userWithoutPassword = { ...dbUser };
        delete (userWithoutPassword as any).password;
        setUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        setIsLoading(false);
        return true;
      } catch (dbError) {
        console.log('Database user creation failed, using mock data:', dbError);
        
        // Fallback: save to mock data for authentication
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      const userWithoutPassword = { ...newUser };
      delete (userWithoutPassword as any).password;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Final fallback - create user in mock data
      try {
        const newUser: User = {
          id: Date.now().toString(),
          username: data.username,
          password: data.password,
          email: data.email,
          role: data.role,
          name: data.name
        };
        
        addUser(newUser);
        
        const userWithoutPassword = { ...newUser };
        delete (userWithoutPassword as any).password;
        setUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        setIsLoading(false);
        return true;
      } catch (fallbackError) {
        console.error('Fallback registration failed:', fallbackError);
        setIsLoading(false);
        return false;
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
