'use client';

import { useState, useEffect } from 'react';
import { getTopProducts } from '@/actions/admin-analytics';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface TopProductsTableProps {
  limit?: number;
  metric?: 'revenue' | 'units';
}

export default function TopProductsTable({
  limit = 50,
  metric = 'revenue',
}: TopProductsTableProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMetric, setCurrentMetric] = useState<'revenue' | 'units'>(metric);
  const [displayLimit, setDisplayLimit] = useState(20);

  useEffect(() => {
    loadProducts();
  }, [currentMetric]);

  const loadProducts = async () => {
    setLoading(true);
    const result = await getTopProducts(limit, currentMetric);
    if (result.success && result.topProducts) {
      setProducts(result.topProducts);
    }
    setLoading(false);
  };

  const displayedProducts = products.slice(0, displayLimit);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMetric('revenue')}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              currentMetric === 'revenue'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Revenue
          </button>
          <button
            onClick={() => setCurrentMetric('units')}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              currentMetric === 'units'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Units
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-gray-400" />
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 text-sm font-semibold text-gray-700">Rank</th>
                  <th className="pb-3 text-sm font-semibold text-gray-700">Product</th>
                  <th className="pb-3 text-sm font-semibold text-gray-700">Shop</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-700">Price</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-700">Revenue</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-700">Units</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.map((product, index) => (
                  <tr key={product.productId} className="border-b border-gray-100 last:border-0">
                    <td className="py-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gray-200">
                            <span className="text-xs text-gray-500">No img</span>
                          </div>
                        )}
                        <p className="max-w-xs truncate text-sm font-medium text-gray-900">
                          {product.title}
                        </p>
                      </div>
                    </td>
                    <td className="py-3">
                      <p className="text-sm text-gray-600">{product.shopName}</p>
                    </td>
                    <td className="py-3 text-right">
                      <p className="text-sm text-gray-900">${product.price.toFixed(2)}</p>
                    </td>
                    <td className="py-3 text-right">
                      <p className="font-semibold text-gray-900">
                        ${product.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="py-3 text-right">
                      <p className="text-sm text-gray-600">{product.unitsSold.toLocaleString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Load More Button */}
          {displayLimit < products.length && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setDisplayLimit((prev) => Math.min(prev + 20, products.length))}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Load More ({products.length - displayLimit} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="py-8 text-center text-gray-500">No products data yet</p>
      )}
    </div>
  );
}
