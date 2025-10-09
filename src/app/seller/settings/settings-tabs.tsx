'use client';

import { useState } from 'react';
import { Store, Palette, Heart, Package, User } from 'lucide-react';
import ShopProfileTab from './shop-profile-tab';
import BrandingTab from './branding-tab';
import NonprofitTab from './nonprofit-tab';
import ShippingTab from './shipping-tab-simple';
import AccountTab from './account-tab';

interface Shop {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  story: string | null;
  logo: string | null;
  bannerImage: string | null;
  colors: { primary?: string; secondary?: string } | null;
  nonprofitId: string | null;
  donationPercentage: number;
  nonprofit?: {
    id: string;
    name: string;
    mission: string;
    logo: string | null;
    website: string | null;
  } | null;
  shippingProfiles: Array<{
    id: string;
    name: string;
    processingTimeMin: number;
    processingTimeMax: number;
    shippingOrigin: unknown;
    shippingRates: unknown;
    carbonNeutralPrice: number | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

interface SettingsTabsProps {
  shop: Shop;
}

type TabId = 'profile' | 'branding' | 'nonprofit' | 'shipping' | 'account';

const tabs = [
  {
    id: 'profile' as TabId,
    name: 'Shop Profile',
    icon: Store,
    description: 'Basic information about your shop',
  },
  {
    id: 'branding' as TabId,
    name: 'Branding',
    icon: Palette,
    description: 'Logo, colors, and visual identity',
  },
  {
    id: 'nonprofit' as TabId,
    name: 'Nonprofit',
    icon: Heart,
    description: 'Partner with a nonprofit organization',
  },
  {
    id: 'shipping' as TabId,
    name: 'Shipping',
    icon: Package,
    description: 'Shipping profiles and rates',
  },
  {
    id: 'account' as TabId,
    name: 'Account',
    icon: User,
    description: 'Account settings and preferences',
  },
];

export default function SettingsTabs({ shop }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      {/* Tab Navigation */}
      <div className="lg:col-span-1">
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon
                  className={`mt-0.5 size-5 flex-shrink-0 ${
                    isActive ? 'text-blue-700' : 'text-gray-400'
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-900'}`}
                  >
                    {tab.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">{tab.description}</p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="lg:col-span-3">
        <div className="rounded-lg border bg-white p-6">
          {activeTab === 'profile' && <ShopProfileTab shop={shop} />}
          {activeTab === 'branding' && <BrandingTab shop={shop} />}
          {activeTab === 'nonprofit' && <NonprofitTab shop={shop} />}
          {activeTab === 'shipping' && <ShippingTab shop={shop} />}
          {activeTab === 'account' && <AccountTab />}
        </div>
      </div>
    </div>
  );
}
