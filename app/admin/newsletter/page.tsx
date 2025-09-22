import { AdminLayout } from '@/components/admin/AdminLayout';
import { NewsletterGenerator } from '@/components/admin/NewsletterGenerator';
import { NewsletterList } from '@/components/admin/NewsletterList';
import { AuthProvider } from '@/contexts/AuthContext';

export default function AdminNewsletterPage() {
  return (
    <AuthProvider>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Newsletter Management</h1>
            <p className="text-gray-600">Create, manage, and send newsletters to your subscribers</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Create New Newsletter</h2>
              <NewsletterGenerator />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Newsletter History</h2>
              <NewsletterList />
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthProvider>
  );
}