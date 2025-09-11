'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/LoginForm';
import { Layout } from '@/components/Layout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { ProfileForm } from '@/components/ProfileForm';

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Layout>
      {user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
    </Layout>
  );
}
