'use client';

import { useState } from 'react';
import { BarChart3, DollarSign, Users, Store, Package, ShoppingCart } from 'lucide-react';
import { OverviewTab } from './tabs/overview-tab';
import { RevenueTab } from './tabs/revenue-tab';
import { UsersTab } from './tabs/users-tab';
import { SellersTab } from './tabs/sellers-tab';
import { ProductsTab } from './tabs/products-tab';
import { OrdersTab } from './tabs/orders-tab';
import { TabsNavigation, Tab } from '@/components/ui/tabs-navigation';

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

const tabs: Tab<TabId>[] = [
  {
    id: 'overview',
    name: 'Overview',
    icon: BarChart3,
    description: 'High-level KPIs',
  },
  {
    id: 'revenue',
    name: 'Revenue',
    icon: DollarSign,
    description: 'Revenue analytics',
  },
  {
    id: 'users',
    name: 'Users',
    icon: Users,
    description: 'User behavior',
  },
  {
    id: 'sellers',
    name: 'Sellers',
    icon: Store,
    description: 'Seller performance',
  },
  {
    id: 'products',
    name: 'Products',
    icon: Package,
    description: 'Product insights',
  },
  {
    id: 'orders',
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
      <TabsNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="horizontal"
      />

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
