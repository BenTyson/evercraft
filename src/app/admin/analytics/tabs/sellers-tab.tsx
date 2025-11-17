import { StatCard } from '@/components/ui/stat-card';
import TopSellersTable from '../top-sellers-table';

interface SellerAnalytics {
  totalSellers: number;
  activeSellers: number;
  activeRate: number;
  newSellersThisMonth: number;
  averageRevenuePerSeller: number;
}

export function SellersTab({ data }: { data: SellerAnalytics }) {
  if (!data) {
    return <div className="text-center text-gray-600">No seller data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sellers" value={data.totalSellers.toLocaleString()} />

        <StatCard
          title="Active Sellers"
          value={data.activeSellers.toLocaleString()}
          subtitle={`${data.activeRate.toFixed(1)}% active rate`}
        />

        <StatCard title="New This Month" value={data.newSellersThisMonth.toLocaleString()} />

        <StatCard
          title="Avg Revenue/Seller"
          value={`$${data.averageRevenuePerSeller.toFixed(2)}`}
        />
      </div>

      {/* Top Sellers Leaderboard */}
      <TopSellersTable limit={20} metric="revenue" />
    </div>
  );
}
