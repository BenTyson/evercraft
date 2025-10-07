import Link from 'next/link';
import { LayoutDashboard, Users, Package, Bell } from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';

export default function AdminLayout({ children }: { children: React.Node }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
          <div className="p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Panel</h2>
            <nav className="space-y-1">
              <AdminNavLink href="/admin" icon={LayoutDashboard}>
                Dashboard
              </AdminNavLink>
              <AdminNavLink href="/admin/applications" icon={Users}>
                Applications
              </AdminNavLink>
              <AdminNavLink href="/admin/products" icon={Package}>
                Products
              </AdminNavLink>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function AdminNavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      <Icon className="size-5" />
      <span>{children}</span>
    </Link>
  );
}
