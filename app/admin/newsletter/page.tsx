import { AdminLayout } from '@/components/admin/AdminLayout';
import { NewsletterList } from '@/components/admin/NewsletterList';
import { AuthProvider } from '@/contexts/AuthContext';

export default function AdminNewsletterPage() {
  return (
    <AuthProvider>
      <AdminLayout>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Newsletter Subscriptions</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your newsletter subscribers</p>
          </div>
          <NewsletterList />
        </div>
      </AdminLayout>
    </AuthProvider>
  );
}