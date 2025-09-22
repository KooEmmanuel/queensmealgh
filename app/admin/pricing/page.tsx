import { AdminLayout } from '@/components/admin/AdminLayout';
import { ConsultationRequestsList } from "@/components/admin/ConsultationRequestsList";
import { AuthProvider } from '@/contexts/AuthContext';

export default function AdminPricingPage() {
  return (
    <AuthProvider>
      <AdminLayout>
        <ConsultationRequestsList />
      </AdminLayout>
    </AuthProvider>
  );
}