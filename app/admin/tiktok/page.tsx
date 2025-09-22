import { AdminLayout } from '@/components/admin/AdminLayout';
import { TikTokPostForm } from '@/components/admin/TikTokPostForm';
import { TikTokPostsList } from '@/components/admin/TikTokPostsList';
import { TikTokContentFetcher } from '@/components/admin/TikTokContentFetcher';
import { AuthProvider } from '@/contexts/AuthContext';

export default function AdminTikTokPage() {
  return (
    <AuthProvider>
      <AdminLayout>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">TikTok Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Create and manage your TikTok videos</p>
          </div>
          <TikTokContentFetcher />
          <TikTokPostForm />
          <TikTokPostsList />
        </div>
      </AdminLayout>
    </AuthProvider>
  );
}