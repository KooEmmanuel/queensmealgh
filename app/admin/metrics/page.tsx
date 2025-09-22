import { AdminLayout } from '@/components/admin/AdminLayout';
import { SocialMetricsForm } from '@/components/admin/SocialMetricsForm';
import { AuthProvider } from '@/contexts/AuthContext';

export default function AdminMetricsPage() {
  return (
    <AuthProvider>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Metrics</h1>
            <p className="text-gray-600">Update the social media statistics displayed on your website</p>
          </div>
          <SocialMetricsForm />
        </div>
      </AdminLayout>
    </AuthProvider>
  );
}