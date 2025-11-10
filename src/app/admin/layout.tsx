import { SiteHeaderWrapper } from '@/components/layout/site-header-wrapper';
import { AdminSidebar } from './admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50">
      <SiteHeaderWrapper />

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
