'use client';

import { useState } from 'react';
import { BarChart3, DollarSign, Users, Store, Package, ShoppingCart } from 'lucide-react';
import { OverviewTab } from './tabs/overview-tab';
import { RevenueTab } from './tabs/revenue-tab';
import { UsersTab } from './tabs/users-tab';
import { SellersTab } from './tabs/sellers-tab';
import { ProductsTab } from './tabs/products-tab';
import { OrdersTab } from './tabs/orders-tab';

type TabId = 'overview' | 'revenue' | 'users' | 'sellers' | 'products' | 'orders';

interface OverviewData {
  totalUsers: number;
  usersThisMonth: number;
  userGrowth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersThisMonth: number;
  orderGrowth: number;
  totalProducts: number;
  productsThisMonth: number;
  productGrowth: number;
  totalSellers: number;
  totalBuyers: number;
  averageOrderValue: number;
}

interface RevenueData {
  totalPlatformFees: number;
  totalSellerPayouts: number;
  categoryBreakdown: Array<{ category: string; revenue: number }>;
}

interface ForecastMonth {
  month: string;
  projected: number;
}

interface TopSeller {
  shopId: string;
  shopName: string;
  totalOrders: number;
  totalRevenue: number;
}

interface UserAnalytics {
  roleDistribution: Array<{ role: string; count: number }>;
  averageLTV: number;
  averageOrdersPerUser: number;
}

interface CohortData {
  cohort: string;
  totalUsers: number;
  activeUsers: number;
  retentionRate: number;
}

interface UserBehavior {
  repeatPurchaseRate: number;
  averagePurchaseFrequency: number;
}

interface SellerAnalytics {
  totalSellers: number;
  activeSellers: number;
  activeRate: number;
  newSellersThisMonth: number;
  averageRevenuePerSeller: number;
}

interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  productsAddedThisMonth: number;
  averageProductsPerShop: number;
}

interface CategoryData {
  category: string;
  count: number;
}

interface InventoryItem {
  productId: string;
  productName: string;
  shopName: string;
  inventory: number;
}

interface OrderAnalytics {
  statusDistribution: Array<{ status: string; count: number }>;
}

interface PaymentAnalytics {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
  statusBreakdown: Array<{ status: string; count: number }>;
}

interface AnalyticsTabsProps {
  overview: OverviewData;
  revenueAnalytics: RevenueData;
  revenueForecast: ForecastMonth[];
  topSellers: TopSeller[];
  userAnalytics: UserAnalytics;
  cohortAnalytics: CohortData[];
  userBehavior: UserBehavior;
  sellerAnalytics: SellerAnalytics;
  productAnalytics: ProductAnalytics;
  categoryAnalytics: CategoryData[];
  inventoryInsights: InventoryItem[];
  orderAnalytics: OrderAnalytics;
  paymentAnalytics: PaymentAnalytics;
}

const tabs = [
  {
    id: 'overview' as TabId,
    name: 'Overview',
    icon: BarChart3,
    description: 'High-level KPIs',
  },
  {
    id: 'revenue' as TabId,
    name: 'Revenue',
    icon: DollarSign,
    description: 'Revenue analytics',
  },
  {
    id: 'users' as TabId,
    name: 'Users',
    icon: Users,
    description: 'User behavior',
  },
  {
    id: 'sellers' as TabId,
    name: 'Sellers',
    icon: Store,
    description: 'Seller performance',
  },
  {
    id: 'products' as TabId,
    name: 'Products',
    icon: Package,
    description: 'Product insights',
  },
  {
    id: 'orders' as TabId,
    name: 'Orders',
    icon: ShoppingCart,
    description: 'Order analytics',
  },
];

export default function AnalyticsTabs({
  overview,
  revenueAnalytics,
  revenueForecast,
  topSellers,
  userAnalytics,
  cohortAnalytics,
  userBehavior,
  sellerAnalytics,
  productAnalytics,
  categoryAnalytics,
  inventoryInsights,
  orderAnalytics,
  paymentAnalytics,
}: AnalyticsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-forest-dark text-forest-dark'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                <Icon className="size-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && <OverviewTab data={overview} />}
        {activeTab === 'revenue' && (
          <RevenueTab data={revenueAnalytics} forecast={revenueForecast} topSellers={topSellers} />
        )}
        {activeTab === 'users' && (
          <UsersTab data={userAnalytics} cohorts={cohortAnalytics} behavior={userBehavior} />
        )}
        {activeTab === 'sellers' && <SellersTab data={sellerAnalytics} />}
        {activeTab === 'products' && (
          <ProductsTab
            data={productAnalytics}
            categories={categoryAnalytics}
            inventory={inventoryInsights}
          />
        )}
        {activeTab === 'orders' && <OrdersTab data={orderAnalytics} payments={paymentAnalytics} />}
      </div>
    </div>
  );
}
