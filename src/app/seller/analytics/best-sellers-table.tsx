'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Package } from 'lucide-react';

interface BestSeller {
  id: string;
  title: string;
  price: number;
  status: string;
  imageUrl: string | null;
  revenue: number;
  unitsSold: number;
  orderCount: number;
}

interface BestSellersTableProps {
  data: BestSeller[];
  sortBy: 'revenue' | 'units';
}

export default function BestSellersTable({ data, sortBy }: BestSellersTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        <div className="text-center">
          <Package className="mx-auto mb-2 size-12 text-gray-400" />
          <p>No sales data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
              {sortBy === 'revenue' ? 'Revenue' : 'Units Sold'}
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Orders</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((product, index) => (
            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-4 text-sm text-gray-600">#{index + 1}</td>
              <td className="px-4 py-4">
                <Link
                  href={`/seller/products/${product.id}/edit`}
                  className="flex items-center gap-3 hover:opacity-80"
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="size-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{product.title}</p>
                    <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-4 text-right text-sm">
                {sortBy === 'revenue' ? (
                  <span className="font-semibold text-gray-900">
                    $
                    {product.revenue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                ) : (
                  <span className="font-semibold text-gray-900">{product.unitsSold} units</span>
                )}
              </td>
              <td className="px-4 py-4 text-right text-sm text-gray-600">{product.orderCount}</td>
              <td className="px-4 py-4 text-right">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    product.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : product.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {product.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
