'use client';

import { useState } from 'react';
import { DollarSign, Receipt, Users, CreditCard } from 'lucide-react';
import AdminOverviewTab from './admin-overview-tab';
import AdminPayoutsTab from './admin-payouts-tab';
import AdminSellersTab from './admin-sellers-tab';
import AdminTransactionsTab from './admin-transactions-tab';
import { TabsNavigation, Tab } from '@/components/ui/tabs-navigation';

type TabId = 'overview' | 'payouts' | 'sellers' | 'transactions';

interface PlatformMetrics {
  totalAvailableBalance: number;
  totalPendingBalance: number;
  totalEarned: number;
  totalPaidOut: number;
  totalPlatformFees: number;
  thisMonthPlatformFees: number;
  totalPlatformDonations: number;
  thisMonthPlatformDonations: number;
  totalNetPlatformRevenue: number;
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

const tabs: Tab<TabId>[] = [
  {
    id: 'overview',
    name: 'Overview',
    icon: DollarSign,
    description: 'Platform metrics',
  },
  {
    id: 'payouts',
    name: 'Payouts',
    icon: Receipt,
    description: 'All seller payouts',
  },
  {
    id: 'sellers',
    name: 'Sellers',
    icon: Users,
    description: 'Seller balances',
  },
  {
    id: 'transactions',
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
      <TabsNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="horizontal"
      />

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
