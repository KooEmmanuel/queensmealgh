import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AuthProvider } from '@/contexts/AuthContext';

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </AuthProvider>
  );
} 