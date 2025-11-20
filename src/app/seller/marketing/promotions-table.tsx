'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { togglePromotionStatus, deletePromotion } from '@/actions/seller-promotions';
import { useRouter } from 'next/navigation';
import {
  TableContainer,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';

interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minimumPurchase: number | null;
  maxUses: number | null;
  currentUses: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isExpired: boolean;
  usagePercentage: number;
}

interface PromotionsTableProps {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
}

export default function PromotionsTable({ promotions, onEdit }: PromotionsTableProps) {
  const router = useRouter();
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleStatus = async (id: string) => {
    setLoadingId(id);
    const result = await togglePromotionStatus(id);
    setLoadingId(null);
    setActionMenuOpen(null);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
      return;
    }

    setLoadingId(id);
    const result = await deletePromotion(id);
    setLoadingId(null);
    setActionMenuOpen(null);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  if (promotions.length === 0) {
    return (
      <EmptyState
        title="No promotions yet"
        description="Create your first promotion to start offering discounts"
        className="flex h-64 items-center justify-center"
      />
    );
  }

  return (
    <TableContainer>
      <table className="w-full">
        <TableHeader className="border-b border-gray-200 bg-transparent">
          <tr>
            <TableHeaderCell className="font-semibold">Code</TableHeaderCell>
            <TableHeaderCell className="font-semibold">Discount</TableHeaderCell>
            <TableHeaderCell className="font-semibold">Usage</TableHeaderCell>
            <TableHeaderCell className="font-semibold">Valid Period</TableHeaderCell>
            <TableHeaderCell className="font-semibold">Status</TableHeaderCell>
            <TableHeaderCell className="font-semibold">Actions</TableHeaderCell>
          </tr>
        </TableHeader>
        <TableBody className="divide-y-0">
          {promotions.map((promo) => (
            <TableRow key={promo.id} className="border-b border-gray-100">
              <TableCell className="py-4">
                <div>
                  <p className="font-mono font-semibold text-gray-900">{promo.code}</p>
                  <p className="mt-1 text-sm text-gray-600">{promo.description}</p>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {promo.discountType === 'PERCENTAGE'
                      ? `${promo.discountValue}% off`
                      : `${formatCurrency(promo.discountValue)} off`}
                  </p>
                  {promo.minimumPurchase && (
                    <p className="text-sm text-gray-600">
                      Min: {formatCurrency(promo.minimumPurchase)}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {promo.currentUses} {promo.maxUses ? `/ ${promo.maxUses}` : ''}
                  </p>
                  {promo.maxUses && (
                    <div className="mt-1">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${Math.min(promo.usagePercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <p className="text-sm text-gray-600">
                  {format(new Date(promo.startDate), 'MMM d')} -{' '}
                  {format(new Date(promo.endDate), 'MMM d, yyyy')}
                </p>
              </TableCell>
              <TableCell className="py-4">
                {promo.isExpired ? (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    Expired
                  </span>
                ) : promo.isActive ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    Inactive
                  </span>
                )}
              </TableCell>
              <TableCell className="py-4">
                <div className="relative">
                  <button
                    onClick={() => setActionMenuOpen(actionMenuOpen === promo.id ? null : promo.id)}
                    disabled={loadingId === promo.id}
                    className="rounded-md p-1 hover:bg-gray-200"
                  >
                    <MoreVertical className="size-5 text-gray-600" />
                  </button>

                  {actionMenuOpen === promo.id && (
                    <div className="absolute right-0 z-10 mt-1 w-48 rounded-md border bg-white shadow-lg">
                      <button
                        onClick={() => {
                          onEdit(promo);
                          setActionMenuOpen(null);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        <Edit className="size-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(promo.id)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
                        disabled={promo.isExpired}
                      >
                        {promo.isActive ? (
                          <>
                            <PowerOff className="size-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="size-4" />
                            Activate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </table>
    </TableContainer>
  );
}
