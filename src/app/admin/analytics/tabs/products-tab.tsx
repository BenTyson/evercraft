import { StatCard } from '@/components/ui/stat-card';
import TopProductsTable from '../top-products-table';

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

export function ProductsTab({
  data,
  categories,
  inventory,
}: {
  data: ProductAnalytics;
  categories: CategoryData[];
  inventory: InventoryItem[];
}) {
  if (!data) {
    return <div className="text-center text-gray-600">No product data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Products" value={data.totalProducts.toLocaleString()} />

        <StatCard title="Active Products" value={data.activeProducts.toLocaleString()} />

        <StatCard title="Added This Month" value={data.productsAddedThisMonth.toLocaleString()} />

        <StatCard title="Avg/Shop" value={data.averageProductsPerShop.toFixed(1)} />
      </div>

      {/* Category Analytics */}
      {categories && categories.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Products by Category</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <div
                key={category.category}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <span className="font-medium text-gray-900">{category.category}</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  {category.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Insights - Low Stock Alerts */}
      {inventory && inventory.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="mb-2 text-lg font-bold text-red-900">Low Stock Alerts</h3>
          <p className="mb-4 text-sm text-red-700">Products with inventory below 10 units</p>
          <div className="space-y-3">
            {inventory.slice(0, 20).map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-600">{item.shopName}</p>
                </div>
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                  {item.inventory} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Products Table */}
      <TopProductsTable limit={50} metric="revenue" />
    </div>
  );
}
