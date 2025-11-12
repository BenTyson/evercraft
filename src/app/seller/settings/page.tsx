/**
 * Seller Settings Page
 *
 * Manage shop profile, branding, nonprofit partnership, shipping, and account settings.
 */

import { redirect } from 'next/navigation';
import { isSeller } from '@/lib/auth';
import { getShopSettings } from '@/actions/seller-settings';
import SettingsTabs from './settings-tabs';

export default async function SellerSettingsPage() {
  const seller = await isSeller();

  if (!seller) {
    redirect('/?error=unauthorized');
  }

  const result = await getShopSettings();

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-red-600">Error loading settings</h1>
        <p className="mt-2 text-gray-600">{result.error}</p>
      </div>
    );
  }

  const shop = result.shop!;

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">Settings</h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Settings Tabs */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <SettingsTabs shop={shop as any} />
      </div>
    </div>
  );
}
