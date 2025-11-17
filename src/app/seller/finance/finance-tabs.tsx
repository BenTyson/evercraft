'use client';

import { useState } from 'react';
import { DollarSign, Receipt, CreditCard, Settings } from 'lucide-react';
import OverviewTab from './overview-tab';
import PayoutsTab from './payouts-tab';
import TransactionsTab from './transactions-tab';
import SettingsTabContent from './settings-tab';
import { TabsNavigation, Tab } from '@/components/ui/tabs-navigation';

type TabId = 'overview' | 'payouts' | 'transactions' | 'settings';

interface FinancialOverview {
  availableBalance: number;
  pendingBalance: number;
  thisWeekEarnings: number;
  thisWeekOrders: number;
  totalEarned: number;
  nextPayoutDate: string;
  estimatedNextPayout: number;
  totalOrders: number;
  totalPayouts: number;
  totalPaidOut: number;
  allTimeGross: number;
  allTimeFees: number;
  allTimeDonations: number;
  allTimeNet: number;
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  transactionCount: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  paidAt: Date | null;
}

interface Transaction {
  id: string;
  orderNumber: string;
  orderDate: Date;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  platformFee: number;
  nonprofitDonation: number;
  sellerPayout: number;
  status: string;
  payoutId: string | null;
}

interface FinanceTabsProps {
  overview: FinancialOverview | null;
  payouts: Payout[];
  transactions: Transaction[];
}

const tabs: Tab<TabId>[] = [
  {
    id: 'overview',
    name: 'Overview',
    icon: DollarSign,
    description: 'Balance and stats',
  },
  {
    id: 'payouts',
    name: 'Payouts',
    icon: Receipt,
    description: 'Payout history',
  },
  {
    id: 'transactions',
    name: 'Transactions',
    icon: CreditCard,
    description: 'Transaction details',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    description: 'Bank account & preferences',
  },
];

export default function FinanceTabs({ overview, payouts, transactions }: FinanceTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <TabsNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="horizontal"
      />

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'overview' && <OverviewTab overview={overview} />}
        {activeTab === 'payouts' && <PayoutsTab payouts={payouts} />}
        {activeTab === 'transactions' && <TransactionsTab transactions={transactions} />}
        {activeTab === 'settings' && <SettingsTabContent />}
      </div>
    </div>
  );
}
