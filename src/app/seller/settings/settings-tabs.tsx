'use client';

import { useState } from 'react';
import { Store, Palette, User, Leaf } from 'lucide-react';
import ShopProfileTab from './shop-profile-tab';
import BrandingTab from './branding-tab';
import AccountTab from './account-tab';
import EcoProfileTab from './eco-profile-tab';
import { TabsNavigation, Tab } from '@/components/ui/tabs-navigation';

interface Shop {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  story: string | null;
  logo: string | null;
  bannerImage: string | null;
  colors: { primary?: string; secondary?: string } | null;
}

interface SettingsTabsProps {
  shop: Shop;
}

type TabId = 'profile' | 'branding' | 'eco-profile' | 'account';

const tabs: Tab<TabId>[] = [
  {
    id: 'profile',
    name: 'Shop Profile',
    icon: Store,
    description: 'Basic information about your shop',
  },
  {
    id: 'branding',
    name: 'Branding',
    icon: Palette,
    description: 'Logo, colors, and visual identity',
  },
  {
    id: 'eco-profile',
    name: 'Eco-Profile',
    icon: Leaf,
    description: 'Sustainability practices and credentials',
  },
  {
    id: 'account',
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
        <TabsNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="vertical"
        />
      </div>

      {/* Tab Content */}
      <div className="lg:col-span-3">
        <div className="rounded-lg border bg-white p-6">
          {activeTab === 'profile' && <ShopProfileTab shop={shop} />}
          {activeTab === 'branding' && <BrandingTab shop={shop} />}
          {activeTab === 'eco-profile' && <EcoProfileTab shopId={shop.id} />}
          {activeTab === 'account' && <AccountTab />}
        </div>
      </div>
    </div>
  );
}
