'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  UserCog,
  FileText,
  Heart,
  DollarSign,
  BarChart3,
  FolderTree,
} from 'lucide-react';

export function AdminSidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Admin Panel</h2>
        <nav className="space-y-1">
          <AdminNavLink href="/admin" icon={LayoutDashboard}>
            Dashboard
          </AdminNavLink>
          <AdminNavLink href="/admin/financial" icon={DollarSign}>
            Financial
          </AdminNavLink>
          <AdminNavLink href="/admin/analytics" icon={BarChart3}>
            Analytics
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
          <AdminNavLink href="/admin/categories" icon={FolderTree}>
            Categories
          </AdminNavLink>
        </nav>
      </div>
    </aside>
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
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
        isActive
          ? 'bg-forest-dark/10 text-forest-dark'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className="size-5" />
      <span>{children}</span>
    </Link>
  );
}
