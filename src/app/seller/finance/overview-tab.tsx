'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar, Receipt } from 'lucide-react';

interface FinancialOverview {
  availableBalance: number;
  pendingBalance: number;
  thisWeekEarnings: number;
  thisWeekOrders: number;
  totalEarned: number;
  nextPayoutDate: string;
  estimatedNextPayout: number;
  totalOrders: number;
  totalPayouts: number;
  totalPaidOut: number;
  allTimeGross: number;
  allTimeFees: number;
  allTimeDonations: number;
  allTimeNet: number;
}

interface OverviewTabProps {
  overview: FinancialOverview | null;
}

export default function OverviewTab({ overview }: OverviewTabProps) {
  if (!overview) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Failed to load financial overview</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.availableBalance.toFixed(2)}</div>
            <p className="text-muted-foreground mt-1 text-xs">Ready for payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.pendingBalance.toFixed(2)}</div>
            <p className="text-muted-foreground mt-1 text-xs">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.thisWeekEarnings.toFixed(2)}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {overview.thisWeekOrders} {overview.thisWeekOrders === 1 ? 'order' : 'orders'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <Receipt className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.totalEarned.toFixed(2)}</div>
            <p className="text-muted-foreground mt-1 text-xs">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Payout Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Next Payout
          </CardTitle>
          <CardDescription>Your next scheduled payout</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Scheduled Date:</span>
              <span className="font-medium">{overview.nextPayoutDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Estimated Amount:</span>
              <span className="text-lg font-medium">
                ${overview.estimatedNextPayout.toFixed(2)}
              </span>
            </div>
            <p className="text-muted-foreground mt-4 text-xs">
              Payouts are processed weekly every Monday and typically arrive in your bank account
              within 5-7 business days.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalOrders}</div>
            <p className="text-muted-foreground mt-1 text-xs">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalPayouts}</div>
            <p className="text-muted-foreground mt-1 text-xs">Completed transfers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.totalPaidOut.toFixed(2)}</div>
            <p className="text-muted-foreground mt-1 text-xs">To your bank account</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
          <CardDescription>All-time revenue and fees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground text-sm">Gross Revenue</span>
              <span className="font-medium">${overview.allTimeGross.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground text-sm">Platform Fees (6.5%)</span>
              <span className="font-medium text-red-600">-${overview.allTimeFees.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground text-sm">Nonprofit Donations</span>
              <span className="font-medium text-green-600">
                -${overview.allTimeDonations.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold">Net Earnings</span>
              <span className="text-lg font-bold">${overview.allTimeNet.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
