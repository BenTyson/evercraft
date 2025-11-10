/**
 * Seller Dashboard Layout
 *
 * Protected layout for seller-only pages with dashboard navigation.
 */

import { redirect } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { SiteHeaderWrapper } from '@/components/layout/site-header-wrapper';
import { SellerNavigation } from '@/components/seller/seller-navigation';
import { isSeller } from '@/lib/auth';

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const seller = await isSeller();

  if (!seller) {
    redirect('/?error=unauthorized');
  }

  return (
    <div className="bg-gray-50">
      <SiteHeaderWrapper />

      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-4">
            <Leaf className="size-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-900">Seller Dashboard</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar Navigation */}
          <SellerNavigation />

          {/* Main Content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
