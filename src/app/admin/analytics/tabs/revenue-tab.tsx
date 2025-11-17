import { StatCard } from '@/components/ui/stat-card';

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
  totalRevenue: number;
  totalOrders: number;
}

export function RevenueTab({
  data,
  forecast,
  topSellers,
}: {
  data: RevenueData;
  forecast: ForecastMonth[];
  topSellers: TopSeller[];
}) {
  if (!data) {
    return <div className="text-center text-gray-600">No revenue data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-2 text-lg font-bold text-gray-900">Revenue Trends (12 Months)</h3>
        <p className="mb-6 text-sm text-gray-600">Monthly revenue and order trends</p>
        {/* Chart will go here */}
        <div className="h-80 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-center text-gray-500">Chart component coming soon</p>
        </div>
      </div>

      {/* Revenue Forecast */}
      {forecast && forecast.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-bold text-gray-900">Revenue Forecast (3 Months)</h3>
          <p className="mb-4 text-sm text-gray-600">Projected revenue based on linear regression</p>
          <div className="space-y-3">
            {forecast.map((month) => (
              <div
                key={month.month}
                className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
              >
                <span className="text-sm font-medium text-gray-900">{month.month}</span>
                <span className="text-lg font-bold text-gray-900">
                  ${month.projected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Sellers */}
      {topSellers && topSellers.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Top Sellers by Revenue</h3>
          <div className="space-y-4">
            {topSellers.slice(0, 10).map((seller, index) => (
              <div
                key={seller.shopId}
                className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{seller.shopName}</p>
                  <p className="text-sm text-gray-600">
                    {seller.totalOrders.toLocaleString()} orders
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ${seller.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Revenue by Category</h3>
        <div className="space-y-3">
          {data.categoryBreakdown.slice(0, 10).map((category) => (
            <div key={category.category} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{category.category}</span>
              <span className="text-sm text-gray-600">
                ${category.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Fees */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatCard
          title="Platform Fees"
          value={`$${data.totalPlatformFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Total collected"
        />

        <StatCard
          title="Seller Payouts"
          value={`$${data.totalSellerPayouts.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Total paid out"
        />
      </div>
    </div>
  );
}
