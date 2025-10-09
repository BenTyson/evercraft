import Link from 'next/link';
import { LayoutDashboard, Package, UserCog, FileText, Heart } from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';

export default function AdminLayout({ children }: { children: React.Node }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="flex">
        {/* Sidebar */}
        <aside className="min-h-[calc(100vh-64px)] w-64 border-r border-gray-200 bg-white">
          <div className="p-4">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Admin Panel</h2>
            <nav className="space-y-1">
              <AdminNavLink href="/admin" icon={LayoutDashboard}>
                Dashboard
              </AdminNavLink>
              <AdminNavLink href="/admin/users" icon={UserCog}>
                Users
              </AdminNavLink>
              <AdminNavLink href="/admin/nonprofits" icon={Heart}>
                Nonprofits
              </AdminNavLink>
              <AdminNavLink href="/admin/applications" icon={FileText}>
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
      className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
    >
      <Icon className="size-5" />
      <span>{children}</span>
    </Link>
  );
}
