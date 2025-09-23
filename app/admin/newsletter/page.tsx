import { AdminLayout } from '@/components/admin/AdminLayout';
import { EnhancedNewsletterGenerator } from '@/components/admin/EnhancedNewsletterGenerator';
import { NewsletterList } from '@/components/admin/NewsletterList';
import { NewsletterSubscribers } from '@/components/admin/NewsletterSubscribers';
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
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Create New Newsletter</h2>
              <EnhancedNewsletterGenerator />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Newsletter Subscribers</h2>
              <NewsletterSubscribers />
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