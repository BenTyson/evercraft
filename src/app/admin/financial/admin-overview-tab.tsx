'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Receipt, Heart, AlertTriangle, CheckCircle } from 'lucide-react';

interface PlatformMetrics {
  totalAvailableBalance: number;
  totalPendingBalance: number;
  totalEarned: number;
  totalPaidOut: number;
  totalPlatformFees: number;
  thisMonthPlatformFees: number;
  totalPayouts: number;
  pendingPayouts: number;
  failedPayouts: number;
  totalPayoutAmount: number;
  successfulPayments: number;
  failedPayments: number;
  paymentSuccessRate: number;
  activeSellers: number;
}

interface NonprofitBreakdown {
  nonprofitId: string;
  nonprofitName: string;
  nonprofitLogo: string | null;
  category: string[];
  totalDonations: number;
  donationCount: number;
}

interface AdminOverviewTabProps {
  metrics: PlatformMetrics | null;
  nonprofitBreakdown: NonprofitBreakdown[];
}

export default function AdminOverviewTab({ metrics, nonprofitBreakdown }: AdminOverviewTabProps) {
  if (!metrics) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Failed to load platform metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Available</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalAvailableBalance.toFixed(2)}</div>
            <p className="text-muted-foreground mt-1 text-xs">Ready for payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalPendingBalance.toFixed(2)}</div>
            <p className="text-muted-foreground mt-1 text-xs">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalEarned.toFixed(2)}</div>
            <p className="text-muted-foreground mt-1 text-xs">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
            <Receipt className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalPaidOut.toFixed(2)}</div>
            <p className="text-muted-foreground mt-1 text-xs">To sellers</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Fees Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Platform Fees
          </CardTitle>
          <CardDescription>Revenue from platform fees (6.5% of gross)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground text-sm">All Time Fees Collected:</span>
              <span className="text-lg font-bold">${metrics.totalPlatformFees.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground text-sm">This Month:</span>
              <span className="font-medium">${metrics.thisMonthPlatformFees.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-muted-foreground text-sm">
                Percentage of Total Earned (
                {metrics.totalEarned > 0
                  ? ((metrics.totalPlatformFees / metrics.totalEarned) * 100).toFixed(1)
                  : 0}
                %):
              </span>
              <span className="text-sm text-gray-600">6.5% standard rate</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSellers}</div>
            <p className="text-muted-foreground mt-1 text-xs">Stripe connected & enabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingPayouts}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {metrics.failedPayouts > 0 && (
                <span className="text-red-600">{metrics.failedPayouts} failed</span>
              )}
              {metrics.failedPayouts === 0 && 'No failures'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <Receipt className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPayouts}</div>
            <p className="text-muted-foreground mt-1 text-xs">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Success Rate</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.paymentSuccessRate.toFixed(1)}%</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {metrics.successfulPayments} of {metrics.successfulPayments + metrics.failedPayments}{' '}
              payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Nonprofit Donations Summary */}
      {nonprofitBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  Top Nonprofit Recipients
                </CardTitle>
                <CardDescription>Organizations receiving the most donations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nonprofitBreakdown.slice(0, 5).map((nonprofit) => (
                <div
                  key={nonprofit.nonprofitId}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {nonprofit.nonprofitLogo ? (
                      <img
                        src={nonprofit.nonprofitLogo}
                        alt={nonprofit.nonprofitName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                        <Heart className="h-5 w-5 text-pink-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{nonprofit.nonprofitName}</p>
                      <p className="text-xs text-gray-500">
                        {nonprofit.category.join(', ') || 'General'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${nonprofit.totalDonations.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{nonprofit.donationCount} donations</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
