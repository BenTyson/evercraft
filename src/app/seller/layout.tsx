/**
 * Seller Dashboard Layout
 *
 * Protected layout for seller-only pages with dashboard navigation.
 */

import { redirect } from 'next/navigation';
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

      <div className="flex">
        {/* Sidebar Navigation */}
        <SellerNavigation />

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
