'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
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
import { format } from 'date-fns';
import { Download, ExternalLink } from 'lucide-react';

interface Payout {
  id: string;
  shopId: string;
  shopName: string;
  shopLogo: string | null;
  ownerName: string | null;
  ownerEmail: string;
  amount: number;
  status: string;
  transactionCount: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  paidAt: Date | null;
  stripePayoutId: string | null;
  failureReason: string | null;
}

interface AdminPayoutsTabProps {
  payouts: Payout[];
}

export default function AdminPayoutsTab({ payouts }: AdminPayoutsTabProps) {
  // Calculate stats
  const stats = {
    total: payouts.length,
    paid: payouts.filter((p) => p.status === 'paid').length,
    pending: payouts.filter((p) => p.status === 'pending').length,
    processing: payouts.filter((p) => p.status === 'processing').length,
    failed: payouts.filter((p) => p.status === 'failed').length,
    totalAmount: payouts.reduce((sum, p) => sum + p.amount, 0),
    paidAmount: payouts.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {formatCurrency(stats.totalAmount)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {formatCurrency(stats.paidAmount)} paid out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending + stats.processing}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {stats.pending} pending, {stats.processing} processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-muted-foreground mt-1 text-xs">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Payouts</CardTitle>
              <CardDescription>Complete payout history across all sellers</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <EmptyState
              title="No payouts yet"
              description="Payouts will appear here once sellers complete their first sales"
            />
          ) : (
            <TableContainer>
              <table className="w-full">
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Seller</TableHeaderCell>
                    <TableHeaderCell>Period</TableHeaderCell>
                    <TableHeaderCell>Orders</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Paid On</TableHeaderCell>
                    <TableHeaderCell align="right">Actions</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-medium">
                        {format(new Date(payout.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <AvatarWithFallback
                            src={payout.shopLogo}
                            alt={payout.shopName}
                            name={payout.shopName}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{payout.shopName}</p>
                            <p className="text-xs text-gray-500">{payout.ownerEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {format(new Date(payout.periodStart), 'MMM d')} -{' '}
                        {format(new Date(payout.periodEnd), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{payout.transactionCount}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(payout.amount)}</TableCell>
                      <TableCell>
                        <StatusBadge status={payout.status} />
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {payout.paidAt ? format(new Date(payout.paidAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Button variant="ghost" size="sm" title="View details">
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
          <CardTitle className="text-base">About Payouts</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-3 text-sm">
          <p>
            <strong>Automated Processing:</strong> Payouts are automatically processed every Monday
            for the previous week&apos;s earnings via Stripe Connect.
          </p>
          <p>
            <strong>Transfer Time:</strong> Once initiated, payouts typically arrive in
            seller&apos;s bank accounts within 5-7 business days.
          </p>
          <p>
            <strong>Fee Structure:</strong> Platform retains 6.5% fee, with the remainder going to
            sellers after their nonprofit donation commitment.
          </p>
          <p>
            <strong>Failed Payouts:</strong> Failures usually occur due to incorrect bank
            information or closed accounts. Sellers must update their Stripe account to resolve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
