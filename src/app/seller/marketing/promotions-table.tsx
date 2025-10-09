'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { togglePromotionStatus, deletePromotion } from '@/actions/seller-promotions';
import { useRouter } from 'next/navigation';

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
      <div className="flex h-64 items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No promotions yet</p>
          <p className="mt-1 text-sm">Create your first promotion to start offering discounts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Discount</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usage</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Valid Period
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promo) => (
            <tr key={promo.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-4">
                <div>
                  <p className="font-mono font-semibold text-gray-900">{promo.code}</p>
                  <p className="mt-1 text-sm text-gray-600">{promo.description}</p>
                </div>
              </td>
              <td className="px-4 py-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {promo.discountType === 'PERCENTAGE'
                      ? `${promo.discountValue}% off`
                      : `$${promo.discountValue.toFixed(2)} off`}
                  </p>
                  {promo.minimumPurchase && (
                    <p className="text-sm text-gray-600">
                      Min: ${promo.minimumPurchase.toFixed(2)}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
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
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-gray-600">
                  {format(new Date(promo.startDate), 'MMM d')} -{' '}
                  {format(new Date(promo.endDate), 'MMM d, yyyy')}
                </p>
              </td>
              <td className="px-4 py-4">
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
              </td>
              <td className="px-4 py-4">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
