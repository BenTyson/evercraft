'use client';

import { useState } from 'react';
import { DollarSign, Receipt, Users, CreditCard } from 'lucide-react';
import AdminOverviewTab from './admin-overview-tab';
import AdminPayoutsTab from './admin-payouts-tab';
import AdminSellersTab from './admin-sellers-tab';
import AdminTransactionsTab from './admin-transactions-tab';

type TabId = 'overview' | 'payouts' | 'sellers' | 'transactions';

interface PlatformMetrics {
  totalAvailableBalance: number;
  totalPendingBalance: number;
  totalEarned: number;
  totalPaidOut: number;
  totalPlatformFees: number;
  thisMonthPlatformFees: number;
  totalPayouts: number;
  pendingPayouts: number;
  failedPayouts: number;
  totalPayoutAmount: number;
  successfulPayments: number;
  failedPayments: number;
  paymentSuccessRate: number;
  activeSellers: number;
}

interface Seller {
  shopId: string;
  shopName: string;
  shopLogo: string | null;
  ownerName: string | null;
  ownerEmail: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalPaidOut: number;
  payoutCount: number;
  stripeStatus: string;
  payoutsEnabled: boolean;
  payoutSchedule: string;
  stripeAccountId?: string | null;
}

interface Payout {
  id: string;
  shopId: string;
  shopName: string;
  shopLogo: string | null;
  ownerName: string | null;
  ownerEmail: string;
  amount: number;
  status: string;
  transactionCount: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  paidAt: Date | null;
  stripePayoutId: string | null;
  failureReason: string | null;
}

interface Transaction {
  id: string;
  orderNumber: string;
  shopId: string;
  shopName: string;
  shopLogo: string | null;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  platformFee: number;
  nonprofitDonation: number;
  sellerPayout: number;
  status: string;
  createdAt: Date;
  payoutId: string | null;
  payoutStatus?: string;
  payoutPaidAt?: Date | null;
}

interface NonprofitBreakdown {
  nonprofitId: string;
  nonprofitName: string;
  nonprofitLogo: string | null;
  category: string[];
  totalDonations: number;
  donationCount: number;
}

interface AdminFinanceTabsProps {
  metrics: PlatformMetrics | null;
  sellers: Seller[];
  payouts: Payout[];
  transactions: Transaction[];
  nonprofitBreakdown: NonprofitBreakdown[];
}

const tabs = [
  {
    id: 'overview' as TabId,
    name: 'Overview',
    icon: DollarSign,
    description: 'Platform metrics',
  },
  {
    id: 'payouts' as TabId,
    name: 'Payouts',
    icon: Receipt,
    description: 'All seller payouts',
  },
  {
    id: 'sellers' as TabId,
    name: 'Sellers',
    icon: Users,
    description: 'Seller balances',
  },
  {
    id: 'transactions' as TabId,
    name: 'Transactions',
    icon: CreditCard,
    description: 'Transaction history',
  },
];

export default function AdminFinanceTabs({
  metrics,
  sellers,
  payouts,
  transactions,
  nonprofitBreakdown,
}: AdminFinanceTabsProps) {
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
        {activeTab === 'overview' && (
          <AdminOverviewTab metrics={metrics} nonprofitBreakdown={nonprofitBreakdown} />
        )}
        {activeTab === 'payouts' && <AdminPayoutsTab payouts={payouts} />}
        {activeTab === 'sellers' && <AdminSellersTab sellers={sellers} />}
        {activeTab === 'transactions' && <AdminTransactionsTab transactions={transactions} />}
      </div>
    </div>
  );
}
