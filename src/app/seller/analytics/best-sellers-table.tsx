'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Package } from 'lucide-react';
import {
  TableContainer,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatNumber } from '@/lib/format';

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
      <EmptyState
        icon={Package}
        title="No sales data available"
        className="flex h-64 items-center justify-center"
      />
    );
  }

  return (
    <TableContainer>
      <table className="w-full">
        <TableHeader className="border-b border-gray-200 bg-transparent">
          <tr>
            <TableHeaderCell className="font-semibold">Rank</TableHeaderCell>
            <TableHeaderCell className="font-semibold">Product</TableHeaderCell>
            <TableHeaderCell align="right" className="font-semibold">
              {sortBy === 'revenue' ? 'Revenue' : 'Units Sold'}
            </TableHeaderCell>
            <TableHeaderCell align="right" className="font-semibold">
              Orders
            </TableHeaderCell>
            <TableHeaderCell align="right" className="font-semibold">
              Status
            </TableHeaderCell>
          </tr>
        </TableHeader>
        <TableBody className="divide-y-0">
          {data.map((product, index) => (
            <TableRow key={product.id} className="border-b border-gray-100">
              <TableCell className="py-4 text-sm text-gray-600">#{index + 1}</TableCell>
              <TableCell className="py-4">
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
                    <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                  </div>
                </Link>
              </TableCell>
              <TableCell align="right" className="py-4 text-sm">
                {sortBy === 'revenue' ? (
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(product.revenue, { useLocale: true })}
                  </span>
                ) : (
                  <span className="font-semibold text-gray-900">
                    {formatNumber(product.unitsSold)} units
                  </span>
                )}
              </TableCell>
              <TableCell align="right" className="py-4 text-sm text-gray-600">
                {product.orderCount}
              </TableCell>
              <TableCell align="right" className="py-4">
                <StatusBadge status={product.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </table>
    </TableContainer>
  );
}
