'use client';

import { useState, useEffect } from 'react';
import { getTopSellers } from '@/actions/admin-analytics';
import { Users, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface TopSellersTableProps {
  limit?: number;
  metric?: 'revenue' | 'orders';
}

export default function TopSellersTable({ limit = 20, metric = 'revenue' }: TopSellersTableProps) {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMetric, setCurrentMetric] = useState<'revenue' | 'orders'>(metric);

  useEffect(() => {
    loadSellers();
  }, [currentMetric]);

  const loadSellers = async () => {
    setLoading(true);
    const result = await getTopSellers(limit, currentMetric);
    if (result.success && result.topSellers) {
      setSellers(result.topSellers);
    }
    setLoading(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Top Sellers</h3>
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
            onClick={() => setCurrentMetric('orders')}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              currentMetric === 'orders'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Orders
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-gray-400" />
        </div>
      ) : sellers.length > 0 ? (
        <div className="space-y-4">
          {sellers.map((seller, index) => (
            <div
              key={seller.shopId}
              className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0"
            >
              {/* Rank */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                {index + 1}
              </div>

              {/* Logo */}
              {seller.shopLogo ? (
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={seller.shopLogo}
                    alt={seller.shopName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                  <Users className="h-6 w-6 text-gray-500" />
                </div>
              )}

              {/* Shop Info */}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{seller.shopName}</p>
                <p className="text-sm text-gray-600">
                  {seller.totalOrders.toLocaleString()} orders
                </p>
              </div>

              {/* Revenue */}
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  ${seller.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">total revenue</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-gray-500">No sellers data yet</p>
      )}
    </div>
  );
}
