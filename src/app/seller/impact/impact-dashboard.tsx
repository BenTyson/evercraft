'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  TrendingUp,
  DollarSign,
  Clock,
  Download,
  Loader2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { getSellerImpact, exportSellerImpact } from '@/actions/seller-impact';
import { Button } from '@/components/ui/button';

interface ImpactData {
  currentNonprofit: {
    id: string;
    name: string;
    logo: string | null;
    mission: string;
    website: string | null;
  } | null;
  donationPercentage: number;
  totalContributed: number;
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
    };
  }>;
}

export function ImpactDashboard() {
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Load impact data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      const result = await getSellerImpact();

      if (result.success && result.impact) {
        setImpact(result.impact);
      } else {
        setError(result.error || 'Failed to load impact data');
      }

      setLoading(false);
    };

    loadData();
  }, []);

  // Handle export
  const handleExport = async () => {
    setExporting(true);

    try {
      const result = await exportSellerImpact();

      if (result.success && result.csvContent && result.filename) {
        // Create download link
        const blob = new Blob([result.csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert(`Error: ${result.error || 'Failed to export'}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to export'}`);
    } finally {
      setExporting(false);
    }
  };

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
        <p className="text-gray-600">No impact data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Configuration */}
      {impact.currentNonprofit ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {impact.currentNonprofit.logo ? (
                <Image
                  src={impact.currentNonprofit.logo}
                  alt={impact.currentNonprofit.name}
                  width={64}
                  height={64}
                  className="size-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full bg-gray-100">
                  <Heart className="size-8 text-gray-600" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{impact.currentNonprofit.name}</h2>
                <p className="text-sm text-gray-600">{impact.currentNonprofit.mission}</p>
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700">
                    {impact.donationPercentage}% of your sales
                  </span>
                  {impact.currentNonprofit.website && (
                    <a
                      href={impact.currentNonprofit.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      Visit website
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <Link href="/seller/settings">
              <Button variant="outline" size="sm">
                Change Nonprofit
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">No Nonprofit Selected</h3>
              <p className="text-sm text-yellow-800">
                Select a nonprofit in your shop settings to start making an impact with your sales.
              </p>
              <Link href="/seller/settings">
                <Button variant="outline" size="sm" className="mt-3">
                  Go to Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Contributed */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contributed</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${impact.totalContributed.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{impact.donationCount} donations</p>
            </div>
            <div className="rounded-full bg-gray-100 p-3">
              <DollarSign className="size-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Paid Out */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid to Nonprofits</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${impact.totalPaid.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{impact.paidCount} donations</p>
            </div>
            <div className="rounded-full bg-gray-100 p-3">
              <CheckCircle className="size-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payout</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${impact.totalPending.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{impact.pendingCount} donations</p>
            </div>
            <div className="rounded-full bg-gray-100 p-3">
              <Clock className="size-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Monthly Contributions</h3>
          <TrendingUp className="size-5 text-gray-400" />
        </div>

        {/* Simple bar chart visualization */}
        <div className="space-y-3">
          {impact.monthlyData.map((month) => {
            const maxAmount = Math.max(...impact.monthlyData.map((m) => m.amount));
            const barWidth = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;

            return (
              <div key={month.month}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{month.month}</span>
                  <span className="font-semibold text-gray-900">${month.amount.toFixed(2)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-gray-400" style={{ width: `${barWidth}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-500">{month.count} donations</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nonprofit Breakdown (if multiple) */}
      {impact.nonprofitBreakdown.length > 1 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Contributions by Nonprofit</h3>
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
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
                      <Heart className="size-5 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{breakdown.nonprofit.name}</p>
                    <p className="text-sm text-gray-600">{breakdown.donationCount} donations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    ${breakdown.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${breakdown.paidAmount.toFixed(2)} paid · ${breakdown.pendingAmount.toFixed(2)}{' '}
                    pending
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Donations */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Recent Donations</h3>
          <Button onClick={handleExport} disabled={exporting} variant="outline" size="sm">
            {exporting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 size-4" />
                Export CSV
              </>
            )}
          </Button>
        </div>

        {impact.recentDonations.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No donations yet. Start selling to make an impact!
          </p>
        ) : (
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
                          Paid
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
        )}
      </div>

      {/* Impact Statement */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-2 font-bold text-gray-900">Impact Report Note</h3>
        <p className="text-sm text-gray-700">
          This report is for your records and marketing purposes. Evercraft facilitates your
          donations by consolidating contributions and distributing them to nonprofits on your
          behalf. Tax receipts are issued to Evercraft as the donor. You can use these metrics in
          your marketing materials to showcase your commitment to environmental causes.
        </p>
      </div>
    </div>
  );
}
