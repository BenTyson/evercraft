'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import {
  Heart,
  TrendingUp,
  DollarSign,
  Clock,
  Loader2,
  ExternalLink,
  CheckCircle,
  ShoppingBag,
} from 'lucide-react';
import { getBuyerImpact } from '@/actions/buyer-impact';

interface ImpactData {
  totalDonated: number;
  totalPaid: number;
  totalPending: number;
  donationCount: number;
  paidCount: number;
  pendingCount: number;
  nonprofitBreakdown: Array<{
    nonprofit: {
      id: string;
      name: string;
      logo: string | null;
      mission: string;
      website: string | null;
    };
    totalAmount: number;
    donationCount: number;
    paidAmount: number;
    pendingAmount: number;
  }>;
  monthlyData: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  recentDonations: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
    orderNumber: string;
    nonprofit: {
      id: string;
      name: string;
      logo: string | null;
      mission: string;
      website: string | null;
    };
  }>;
}

export function ImpactDashboard() {
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load impact data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      const result = await getBuyerImpact();

      if (result.success && result.impact) {
        setImpact(result.impact);
      } else {
        setError(result.error || 'Failed to load donation history');
      }

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (!impact) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-600">No donation history available</p>
      </div>
    );
  }

  // No donations yet
  if (impact.donationCount === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <Heart className="mx-auto mb-4 size-16 text-gray-300" />
        <h3 className="mb-2 text-xl font-bold text-gray-900">No donations yet</h3>
        <p className="text-muted-foreground mb-6">
          Add an optional donation at checkout to support nonprofits while shopping on Evercraft.
        </p>
        <a
          href="/browse"
          className="bg-eco-dark hover:bg-eco-dark/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white"
        >
          <ShoppingBag className="size-4" />
          Start Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Donated */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Donated</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${impact.totalDonated.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{impact.donationCount} donations</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <DollarSign className="size-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Paid */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sent to Nonprofits</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${impact.totalPaid.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{impact.paidCount} donations</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <CheckCircle className="size-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Distribution</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${impact.totalPending.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{impact.pendingCount} donations</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <Clock className="size-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      {impact.monthlyData.some((m) => m.amount > 0) && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Monthly Donations</h3>
            <TrendingUp className="size-5 text-gray-400" />
          </div>

          {/* Simple bar chart visualization */}
          <div className="space-y-3">
            {impact.monthlyData
              .filter((m) => m.amount > 0)
              .map((month) => {
                const maxAmount = Math.max(...impact.monthlyData.map((m) => m.amount));
                const barWidth = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;

                return (
                  <div key={month.month}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{month.month}</span>
                      <span className="font-semibold text-gray-900">
                        ${month.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{month.count} donations</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Nonprofit Breakdown */}
      {impact.nonprofitBreakdown.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Nonprofits You&apos;ve Supported</h3>
          <div className="space-y-4">
            {impact.nonprofitBreakdown.map((breakdown) => (
              <div
                key={breakdown.nonprofit.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3">
                  {breakdown.nonprofit.logo ? (
                    <Image
                      src={breakdown.nonprofit.logo}
                      alt={breakdown.nonprofit.name}
                      width={48}
                      height={48}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-full bg-pink-100">
                      <Heart className="size-6 text-pink-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{breakdown.nonprofit.name}</p>
                    <p className="text-sm text-gray-600">{breakdown.nonprofit.mission}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span>{breakdown.donationCount} donations</span>
                      {breakdown.nonprofit.website && (
                        <a
                          href={breakdown.nonprofit.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          Visit website
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    ${breakdown.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${breakdown.paidAmount.toFixed(2)} distributed · $
                    {breakdown.pendingAmount.toFixed(2)} pending
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Donations */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Donation History</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold tracking-wide text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Nonprofit</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {impact.recentDonations.map((donation) => (
                <tr key={donation.id} className="text-sm">
                  <td className="px-4 py-3 text-gray-600">
                    {formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{donation.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{donation.nonprofit.name}</td>
                  <td className="px-4 py-3">
                    {donation.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        <CheckCircle className="size-3" />
                        Distributed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                        <Clock className="size-3" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ${donation.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Information Note */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-2 font-bold text-blue-900">Tax Deduction Information</h3>
        <p className="text-sm text-blue-800">
          Your donations may be tax-deductible if you itemize deductions. Evercraft facilitates your
          donations and can provide documentation for your tax records. Consult with a tax
          professional to determine your eligibility for deductions. Donations shown as
          &quot;Distributed&quot; have been sent to the respective nonprofits.
        </p>
      </div>
    </div>
  );
}
