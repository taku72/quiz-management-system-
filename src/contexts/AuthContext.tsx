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

    // Determine if we should use local (mock) auth. Enabled by default in dev, opt-in via env in prod.
    const isDev = process.env.NODE_ENV !== 'production';
    const useLocalAuth = !isSupabaseConfigured && (process.env.NEXT_PUBLIC_USE_LOCAL_AUTH === 'true' || isDev);

    if (!isSupabaseConfigured) {
      if (useLocalAuth) {
        // Use localStorage for mock authentication (development/testing only)
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } else {
        // In production without Supabase, do not auto-login from localStorage
        setUser(null);
        localStorage.removeItem('currentUser');
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
      if (event === 'SIGNED_OUT') {
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
      } else if (!session) {
        // Only use localStorage fallback when using local (mock) auth
        const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
          process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';
        const isDev = process.env.NODE_ENV !== 'production';
        const useLocalAuth = !isSupabaseConfigured && (process.env.NEXT_PUBLIC_USE_LOCAL_AUTH === 'true' || isDev);

        if (useLocalAuth) {
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
            return;
          }
        }
        setUser(null);
        localStorage.removeItem('currentUser');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const trimmedUsername = username.trim();
      console.log('Attempting login with:', { username: trimmedUsername, password });

      // Use mock data for testing
      const foundUser = users.find((u: any) => u.username === trimmedUsername && u.password === password);

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
        const dbUser = await userService.getUserByUsername(trimmedUsername);
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

    const trimmedUsername = data.username.trim();
    const trimmedEmail = data.email.trim();

    try {
      // Use database authentication
      // Check if username or email already exists in database
      const existingByUsername = await userService.getUserByUsername(trimmedUsername);
      const existingByEmail = await userService.getUserByEmail(trimmedEmail);

      // Also check mock data for duplicates
      const mockUserByUsername = findUserByUsername(trimmedUsername);
      const mockUserByEmail = findUserByEmail(trimmedEmail);

      if (existingByUsername || existingByEmail || mockUserByUsername || mockUserByEmail) {
        setIsLoading(false);
        return false;
      }

      // Create user for mock data
      const newUser: User = {
        id: Date.now().toString(),
        username: trimmedUsername,
        password: data.password,
        email: trimmedEmail,
        role: data.role,
        name: data.name
      };

      try {
        // Save to database (with password)
        const dbUser = await userService.createUser({
          username: trimmedUsername,
          email: trimmedEmail,
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
          username: trimmedUsername,
          password: data.password,
          email: trimmedEmail,
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

  const updateProfile = async (updates: { name?: string; username?: string; email?: string }): Promise<boolean> => {
    if (!user) return false;
    try {
      // Try database first
      const updated = await userService.updateUser(user.id, updates);
      const newUser = { ...user, ...updates } as User;

      if (updated) {
        setUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        return true;
      }

      // Fallback: update local mock user
      const saved = localStorage.getItem('currentUser');
      if (saved) {
        const current = JSON.parse(saved);
        const merged = { ...current, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(merged));
        setUser(merged);
        return true;
      }

      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      return true;
    } catch (e) {
      console.error('Update profile failed:', e);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
