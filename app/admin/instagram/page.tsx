import { AdminLayout } from '@/components/admin/AdminLayout';
import { InstagramPostForm } from '@/components/admin/InstagramPostForm';
import { InstagramPostsList } from '@/components/admin/InstagramPostsList';
import { AuthProvider } from '@/contexts/AuthContext';

export default function AdminInstagramPage() {
  return (
    <AuthProvider>
      <AdminLayout>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Instagram Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Create and manage your Instagram posts</p>
          </div>
          <InstagramPostForm />
          <InstagramPostsList />
        </div>
      </AdminLayout>
    </AuthProvider>
  );
}