'use client';

import { useEffect, useState, useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import {
  DollarSign,
  Heart,
  CheckCircle,
  Clock,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getPendingDonations,
  createNonprofitPayout,
  getNonprofitPayouts,
} from '@/actions/admin-nonprofits';
import { Button } from '@/components/ui/button';

interface PendingNonprofit {
  nonprofit: {
    id: string;
    name: string;
    logo: string | null;
    ein: string;
  };
  totalAmount: number;
  donationCount: number;
  sellerContributionAmount: number;
  sellerContributionCount: number;
  buyerDirectAmount: number;
  buyerDirectCount: number;
  platformRevenueAmount: number;
  platformRevenueCount: number;
  oldestDonation: Date;
  donations: Array<{
    id: string;
    amount: number;
    createdAt: Date;
    donorType: string;
    shop: { name: string } | null;
    order: { orderNumber: string; createdAt: Date };
  }>;
}

interface PayoutHistoryItem {
  id: string;
  amount: number;
  status: string;
  periodStart: Date;
  periodEnd: Date;
  donationCount: number;
  method: string;
  createdAt: Date;
  paidAt: Date | null;
  nonprofit: {
    name: string;
    logo: string | null;
  };
}

export function PayoutsDashboard() {
  const [pendingNonprofits, setPendingNonprofits] = useState<PendingNonprofit[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [expandedNonprofit, setExpandedNonprofit] = useState<string | null>(null);
  const [processingNonprofit, setProcessingNonprofit] = useState<string | null>(null);

  // Load data
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [pendingResult, historyResult] = await Promise.all([
        getPendingDonations(),
        getNonprofitPayouts({ page: 1, pageSize: 10 }),
      ]);

      if (pendingResult.success && pendingResult.nonprofits) {
        setPendingNonprofits(pendingResult.nonprofits);
      } else {
        setError(pendingResult.error || 'Failed to load pending donations');
      }

      if (historyResult.success && historyResult.payouts) {
        setPayoutHistory(historyResult.payouts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle payout creation
  const handleCreatePayout = async (
    nonprofitId: string,
    nonprofitName: string,
    donationIds: string[],
    totalAmount: number
  ) => {
    if (
      !confirm(
        `Create payout of $${totalAmount.toFixed(2)} for ${nonprofitName}?\n\nThis will mark ${donationIds.length} donations as paid.`
      )
    ) {
      return;
    }

    setProcessingNonprofit(nonprofitId);

    startTransition(async () => {
      try {
        // Calculate period (oldest to newest donation)
        const nonprofit = pendingNonprofits.find((n) => n.nonprofit.id === nonprofitId);
        if (!nonprofit) return;

        const donations = nonprofit.donations;
        const oldestDate = new Date(
          Math.min(...donations.map((d) => new Date(d.createdAt).getTime()))
        );
        const newestDate = new Date(
          Math.max(...donations.map((d) => new Date(d.createdAt).getTime()))
        );

        const result = await createNonprofitPayout({
          nonprofitId,
          donationIds,
          periodStart: oldestDate,
          periodEnd: newestDate,
          method: 'manual',
          notes: `Manual payout processed for ${donationIds.length} donations`,
        });

        if (result.success) {
          alert(`✅ ${result.message}\n\nPayout has been marked as paid.`);
          await loadData();
        } else {
          alert(`❌ Error: ${result.error}`);
        }
      } catch (err) {
        alert(`❌ Error: ${err instanceof Error ? err.message : 'Failed to create payout'}`);
      } finally {
        setProcessingNonprofit(null);
      }
    });
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
        <Button variant="outline" className="mt-4" onClick={loadData}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Donations Section */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Pending Donations</h2>

        {pendingNonprofits.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <CheckCircle className="mx-auto mb-4 size-12 text-green-600" />
            <p className="text-lg font-semibold text-gray-900">All caught up!</p>
            <p className="text-sm text-gray-600">No pending donations to process</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingNonprofits.map((item) => {
              const isExpanded = expandedNonprofit === item.nonprofit.id;
              const isProcessing = processingNonprofit === item.nonprofit.id;

              return (
                <div
                  key={item.nonprofit.id}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                >
                  {/* Summary Row */}
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      {/* Logo */}
                      {item.nonprofit.logo ? (
                        <Image
                          src={item.nonprofit.logo}
                          alt={item.nonprofit.name}
                          width={48}
                          height={48}
                          className="size-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-12 items-center justify-center rounded-full bg-pink-100">
                          <Heart className="size-6 text-pink-600" />
                        </div>
                      )}

                      {/* Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.nonprofit.name}</h3>
                        <p className="text-sm text-gray-600">EIN: {item.nonprofit.ein}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Stats */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${item.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.donationCount} donation{item.donationCount !== 1 ? 's' : ''}
                        </p>
                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                          {item.sellerContributionCount > 0 && (
                            <div>
                              Sellers: ${item.sellerContributionAmount.toFixed(2)} (
                              {item.sellerContributionCount})
                            </div>
                          )}
                          {item.buyerDirectCount > 0 && (
                            <div>
                              Buyers: ${item.buyerDirectAmount.toFixed(2)} ({item.buyerDirectCount})
                            </div>
                          )}
                          {item.platformRevenueCount > 0 && (
                            <div>
                              Platform: ${item.platformRevenueAmount.toFixed(2)} (
                              {item.platformRevenueCount})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpandedNonprofit(isExpanded ? null : item.nonprofit.id)
                          }
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="mr-1 size-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="mr-1 size-4" />
                              Details
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleCreatePayout(
                              item.nonprofit.id,
                              item.nonprofit.name,
                              item.donations.map((d) => d.id),
                              item.totalAmount
                            )
                          }
                          disabled={isPending || isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-1 size-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <DollarSign className="mr-1 size-4" />
                              Mark as Paid
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <h4 className="mb-3 text-sm font-semibold tracking-wide text-gray-600 uppercase">
                        Donation Details ({item.donationCount})
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-gray-200 bg-white text-xs font-semibold tracking-wide text-gray-600 uppercase">
                            <tr>
                              <th className="px-4 py-2 text-left">Date</th>
                              <th className="px-4 py-2 text-left">Order</th>
                              <th className="px-4 py-2 text-left">Type</th>
                              <th className="px-4 py-2 text-left">Shop</th>
                              <th className="px-4 py-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {item.donations.map((donation) => (
                              <tr key={donation.id} className="text-sm">
                                <td className="px-4 py-3 text-gray-600">
                                  {formatDistanceToNow(new Date(donation.createdAt), {
                                    addSuffix: true,
                                  })}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {donation.order.orderNumber}
                                </td>
                                <td className="px-4 py-3">
                                  {donation.donorType === 'SELLER_CONTRIBUTION' && (
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                      Seller
                                    </span>
                                  )}
                                  {donation.donorType === 'BUYER_DIRECT' && (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                      Buyer
                                    </span>
                                  )}
                                  {donation.donorType === 'PLATFORM_REVENUE' && (
                                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">
                                      Platform
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {donation.shop?.name || 'N/A'}
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
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payout History Section */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Recent Payouts</h2>

        {payoutHistory.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <Clock className="mx-auto mb-3 size-10 text-gray-400" />
            <p className="text-sm text-gray-600">No payout history yet</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Nonprofit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Date Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Donations
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payoutHistory.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {payout.nonprofit.logo ? (
                          <Image
                            src={payout.nonprofit.logo}
                            alt={payout.nonprofit.name}
                            width={32}
                            height={32}
                            className="size-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded-full bg-pink-100">
                            <Heart className="size-4 text-pink-600" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{payout.nonprofit.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payout.paidAt
                        ? formatDistanceToNow(new Date(payout.paidAt), { addSuffix: true })
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        <span>
                          {new Date(payout.periodStart).toLocaleDateString()} -{' '}
                          {new Date(payout.periodEnd).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{payout.donationCount}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      ${payout.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
