'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AvatarWithFallback } from '@/components/ui/avatar-with-fallback';
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
import { ExternalLink, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Seller {
  shopId: string;
  shopName: string;
  shopLogo: string | null;
  ownerName: string | null;
  ownerEmail: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalPaidOut: number;
  payoutCount: number;
  stripeStatus: string;
  payoutsEnabled: boolean;
  payoutSchedule: string;
  stripeAccountId?: string | null;
}

interface AdminSellersTabProps {
  sellers: Seller[];
}

export default function AdminSellersTab({ sellers }: AdminSellersTabProps) {
  const [sortBy, setSortBy] = useState<'totalEarned' | 'availableBalance'>('totalEarned');

  const getStripeStatusBadge = (status: string, payoutsEnabled: boolean) => {
    if (status === 'active' && payoutsEnabled) {
      return <Badge variant="default">Active</Badge>;
    }
    if (status === 'pending' || status === 'onboarding') {
      return <Badge variant="secondary">Pending Setup</Badge>;
    }
    if (status === 'disabled') {
      return <Badge variant="destructive">Disabled</Badge>;
    }
    return <Badge variant="outline">Not Connected</Badge>;
  };

  // Calculate platform totals
  const platformTotals = sellers.reduce(
    (acc, seller) => ({
      totalAvailable: acc.totalAvailable + seller.availableBalance,
      totalPending: acc.totalPending + seller.pendingBalance,
      totalEarned: acc.totalEarned + seller.totalEarned,
      totalPaidOut: acc.totalPaidOut + seller.totalPaidOut,
    }),
    { totalAvailable: 0, totalPending: 0, totalEarned: 0, totalPaidOut: 0 }
  );

  // Sort sellers
  const sortedSellers = [...sellers].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="space-y-6">
      {/* Platform Totals */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellers.length}</div>
            <p className="text-muted-foreground mt-1 text-xs">Registered shops</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(platformTotals.totalAvailable)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Across all sellers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(platformTotals.totalEarned)}</div>
            <p className="text-muted-foreground mt-1 text-xs">All time platform-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(platformTotals.totalPaidOut)}</div>
            <p className="text-muted-foreground mt-1 text-xs">To seller accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Sellers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seller Financial Overview</CardTitle>
              <CardDescription>Balance and Stripe status for all sellers</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Button
                variant={sortBy === 'totalEarned' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('totalEarned')}
              >
                Total Earned
              </Button>
              <Button
                variant={sortBy === 'availableBalance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('availableBalance')}
              >
                Available Balance
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sellers.length === 0 ? (
            <EmptyState
              title="No sellers yet"
              description="Sellers will appear here once they complete onboarding"
            />
          ) : (
            <TableContainer>
              <table className="w-full">
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Shop</TableHeaderCell>
                    <TableHeaderCell>Available</TableHeaderCell>
                    <TableHeaderCell>Pending</TableHeaderCell>
                    <TableHeaderCell>Total Earned</TableHeaderCell>
                    <TableHeaderCell>Paid Out</TableHeaderCell>
                    <TableHeaderCell>Payouts</TableHeaderCell>
                    <TableHeaderCell>Stripe Status</TableHeaderCell>
                    <TableHeaderCell align="right">Actions</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {sortedSellers.map((seller) => (
                    <TableRow key={seller.shopId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <AvatarWithFallback
                            src={seller.shopLogo}
                            alt={seller.shopName}
                            name={seller.shopName}
                            size="md"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{seller.shopName}</p>
                            <p className="text-xs text-gray-500">{seller.ownerEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(seller.availableBalance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-yellow-600">
                          {formatCurrency(seller.pendingBalance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {formatCurrency(seller.totalEarned)}
                          </span>
                          {seller.totalEarned > 0 && (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatCurrency(seller.totalPaidOut)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{seller.payoutCount}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStripeStatusBadge(seller.stripeStatus, seller.payoutsEnabled)}
                      </TableCell>
                      <TableCell align="right">
                        <Button variant="ghost" size="sm" title="View seller details">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About Seller Finances</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-3 text-sm">
          <p>
            <strong>Available Balance:</strong> Funds ready for the next scheduled payout (weekly,
            every Monday).
          </p>
          <p>
            <strong>Pending Balance:</strong> Recent transactions still processing or held for fraud
            prevention.
          </p>
          <p>
            <strong>Stripe Status:</strong> &ldquo;Active&rdquo; means the seller can receive
            payouts. &ldquo;Pending Setup&rdquo; means they need to complete Stripe Connect
            onboarding.
          </p>
          <p>
            <strong>View Details:</strong> Click the view icon to see a seller&apos;s complete
            financial history, including all transactions and payouts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
