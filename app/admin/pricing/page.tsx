import { AdminLayout } from '@/components/admin/AdminLayout';
import { PricingSubscriptionsList } from "@/components/admin/PricingSubscriptionsList";
import { AuthProvider } from '@/contexts/AuthContext';

export default function AdminPricingPage() {
  return (
    <AuthProvider>
      <AdminLayout>
        <PricingSubscriptionsList />
      </AdminLayout>
    </AuthProvider>
  );
}