/**
 * Seller Dashboard Layout
 *
 * Protected layout for seller-only pages with dashboard navigation.
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, Package, Settings, BarChart3, Leaf, ShoppingBag, LayoutList } from 'lucide-react';
import { SiteHeaderWrapper } from '@/components/layout/site-header-wrapper';
import { cn } from '@/lib/utils';
import { isSeller } from '@/lib/auth';

const navigation = [
  { name: 'Dashboard', href: '/seller', icon: Home },
  { name: 'Products', href: '/seller/products', icon: Package },
  { name: 'Sections', href: '/seller/sections', icon: LayoutList },
  { name: 'Orders', href: '/seller/orders', icon: ShoppingBag },
  { name: 'Analytics', href: '/seller/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/seller/settings', icon: Settings },
];

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const seller = await isSeller();

  if (!seller) {
    redirect('/?error=unauthorized');
  }

  return (
    <div className="min-h-screen">
      <SiteHeaderWrapper />

      <div className="border-b bg-neutral-50 dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-4">
            <Leaf className="text-forest-dark size-5" />
            <span className="text-sm font-semibold">Seller Dashboard</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block">
            <nav className="bg-card sticky top-24 space-y-1 rounded-lg border p-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      'hover:bg-eco-light/50 hover:text-forest-dark'
                    )}
                  >
                    <Icon className="size-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
