'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/components/LandingPage';
import { Layout } from '@/components/Layout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { ProfileForm } from '@/components/ProfileForm';

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <Layout>
      {user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
    </Layout>
  );
}
