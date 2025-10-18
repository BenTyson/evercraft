'use client';

import { useState } from 'react';
import { DollarSign, Receipt, CreditCard, Settings } from 'lucide-react';
import OverviewTab from './overview-tab';
import PayoutsTab from './payouts-tab';
import TransactionsTab from './transactions-tab';
import SettingsTabContent from './settings-tab';

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

const tabs = [
  {
    id: 'overview' as TabId,
    name: 'Overview',
    icon: DollarSign,
    description: 'Balance and stats',
  },
  {
    id: 'payouts' as TabId,
    name: 'Payouts',
    icon: Receipt,
    description: 'Payout history',
  },
  {
    id: 'transactions' as TabId,
    name: 'Transactions',
    icon: CreditCard,
    description: 'Transaction details',
  },
  {
    id: 'settings' as TabId,
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
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
                  isActive
                    ? 'border-forest-dark text-forest-dark'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } `}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

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
