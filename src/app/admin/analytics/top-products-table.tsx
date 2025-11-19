'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTopProducts } from '@/actions/admin-analytics';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import {
  TableContainer,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
} from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/format';

interface TopProduct {
  productId: string;
  image: string | null;
  title: string;
  shopName: string;
  price: number;
  totalRevenue: number;
  unitsSold: number;
}

interface TopProductsTableProps {
  limit?: number;
  metric?: 'revenue' | 'units';
}

export default function TopProductsTable({
  limit = 50,
  metric = 'revenue',
}: TopProductsTableProps) {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMetric, setCurrentMetric] = useState<'revenue' | 'units'>(metric);
  const [displayLimit, setDisplayLimit] = useState(20);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const result = await getTopProducts(limit, currentMetric);
    if (result.success && result.topProducts) {
      setProducts(result.topProducts as TopProduct[]);
    }
    setLoading(false);
  }, [limit, currentMetric]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
          <TableContainer className="border-0">
            <table className="w-full">
              <TableHeader className="border-b border-gray-200 bg-transparent">
                <tr className="text-left">
                  <TableHeaderCell className="px-0 pb-3 font-semibold">Rank</TableHeaderCell>
                  <TableHeaderCell className="px-0 pb-3 font-semibold">Product</TableHeaderCell>
                  <TableHeaderCell className="px-0 pb-3 font-semibold">Shop</TableHeaderCell>
                  <TableHeaderCell align="right" className="px-0 pb-3 font-semibold">
                    Price
                  </TableHeaderCell>
                  <TableHeaderCell align="right" className="px-0 pb-3 font-semibold">
                    Revenue
                  </TableHeaderCell>
                  <TableHeaderCell align="right" className="px-0 pb-3 font-semibold">
                    Units
                  </TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody className="divide-y-0">
                {displayedProducts.map((product, index) => (
                  <TableRow
                    key={product.productId}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="px-0">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="px-0">
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
                    </TableCell>
                    <TableCell className="px-0">
                      <p className="text-sm text-gray-600">{product.shopName}</p>
                    </TableCell>
                    <TableCell align="right" className="px-0">
                      <p className="text-sm text-gray-900">{formatCurrency(product.price)}</p>
                    </TableCell>
                    <TableCell align="right" className="px-0">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(product.totalRevenue, { useLocale: true })}
                      </p>
                    </TableCell>
                    <TableCell align="right" className="px-0">
                      <p className="text-sm text-gray-600">{formatNumber(product.unitsSold)}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </TableContainer>

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
        <EmptyState title="No products data yet" />
      )}
    </div>
  );
}
