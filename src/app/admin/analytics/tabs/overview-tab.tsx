import { Users, DollarSign, ShoppingCart, Package, Store } from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';

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

interface InsightCardProps {
  title: string;
  value: string;
  isPositive: boolean;
  subtitle: string;
}

function InsightCard({ title, value, isPositive, subtitle }: InsightCardProps) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {value}
        </p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

export function OverviewTab({ data }: { data: OverviewData }) {
  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={data.totalUsers.toLocaleString()}
          subtitle={`${data.usersThisMonth} this month`}
          growth={data.userGrowth}
          icon={Users}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100"
        />

        <MetricCard
          title="Total Revenue"
          value={`$${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`$${data.revenueThisMonth.toLocaleString()} this month`}
          growth={data.revenueGrowth}
          icon={DollarSign}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100"
        />

        <MetricCard
          title="Total Orders"
          value={data.totalOrders.toLocaleString()}
          subtitle={`${data.ordersThisMonth} this month`}
          growth={data.orderGrowth}
          icon={ShoppingCart}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100"
        />

        <MetricCard
          title="Active Products"
          value={data.totalProducts.toLocaleString()}
          subtitle={`${data.productsThisMonth} added this month`}
          growth={data.productGrowth}
          icon={Package}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100"
        />

        <MetricCard
          title="Total Sellers"
          value={data.totalSellers.toLocaleString()}
          subtitle="Shops on platform"
          icon={Store}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100"
        />

        <MetricCard
          title="Total Buyers"
          value={data.totalBuyers.toLocaleString()}
          subtitle="Have placed orders"
          icon={Users}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100"
        />

        <MetricCard
          title="Avg Order Value"
          value={`$${data.averageOrderValue.toFixed(2)}`}
          subtitle="Per order"
          icon={DollarSign}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100"
        />
      </div>

      {/* Quick Insights */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Quick Insights</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InsightCard
            title="User Growth"
            value={`${data.userGrowth >= 0 ? '+' : ''}${data.userGrowth.toFixed(1)}%`}
            isPositive={data.userGrowth >= 0}
            subtitle="Month-over-month"
          />
          <InsightCard
            title="Revenue Growth"
            value={`${data.revenueGrowth >= 0 ? '+' : ''}${data.revenueGrowth.toFixed(1)}%`}
            isPositive={data.revenueGrowth >= 0}
            subtitle="Month-over-month"
          />
          <InsightCard
            title="Order Growth"
            value={`${data.orderGrowth >= 0 ? '+' : ''}${data.orderGrowth.toFixed(1)}%`}
            isPositive={data.orderGrowth >= 0}
            subtitle="Month-over-month"
          />
          <InsightCard
            title="Buyer Rate"
            value={`${data.totalUsers > 0 ? ((data.totalBuyers / data.totalUsers) * 100).toFixed(1) : 0}%`}
            isPositive={true}
            subtitle="Users who purchase"
          />
        </div>
      </div>
    </div>
  );
}
