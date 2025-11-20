'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Download } from 'lucide-react';

interface Transaction {
  id: string;
  orderNumber: string;
  shopId: string;
  shopName: string;
  shopLogo: string | null;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  platformFee: number;
  nonprofitDonation: number;
  sellerPayout: number;
  status: string;
  createdAt: Date;
  payoutId: string | null;
  payoutStatus?: string;
  payoutPaidAt?: Date | null;
}

interface AdminTransactionsTabProps {
  transactions: Transaction[];
}

export default function AdminTransactionsTab({ transactions }: AdminTransactionsTabProps) {
  const getPayoutBadge = (payoutId: string | null, payoutStatus?: string) => {
    if (!payoutId) {
      return <Badge variant="outline">Upcoming</Badge>;
    }
    if (payoutStatus === 'paid') {
      return <Badge variant="default">Paid Out</Badge>;
    }
    return <Badge variant="secondary">{payoutStatus || 'Processing'}</Badge>;
  };

  // Calculate summary
  const summary = transactions.reduce(
    (acc, t) => ({
      totalGross: acc.totalGross + t.amount,
      totalFees: acc.totalFees + t.platformFee,
      totalDonations: acc.totalDonations + t.nonprofitDonation,
      totalNet: acc.totalNet + t.sellerPayout,
    }),
    { totalGross: 0, totalFees: 0, totalDonations: 0, totalNet: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction Summary</CardTitle>
          <CardDescription>Showing {transactions.length} most recent transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Total Transactions:</span>
            <span className="font-medium">{transactions.length}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Total Gross Revenue:</span>
            <span className="font-medium">{formatCurrency(summary.totalGross)}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Total Platform Fees:</span>
            <span className="text-forest-dark font-medium">
              {formatCurrency(summary.totalFees)}
            </span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Total Nonprofit Donations:</span>
            <span className="font-medium text-green-600">
              {formatCurrency(summary.totalDonations)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="font-semibold">Total Seller Payouts:</span>
            <span className="text-lg font-bold">{formatCurrency(summary.totalNet)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                Platform-wide transaction history with full breakdown
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Transactions will appear here when customers make purchases"
            />
          ) : (
            <TableContainer>
              <table className="w-full">
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Order #</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Shop</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Gross</TableHeaderCell>
                    <TableHeaderCell>Platform Fee</TableHeaderCell>
                    <TableHeaderCell>Donation</TableHeaderCell>
                    <TableHeaderCell>Seller Net</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Payout Status</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.orderNumber}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AvatarWithFallback
                            src={transaction.shopLogo}
                            alt={transaction.shopName}
                            name={transaction.shopName}
                            size="sm"
                          />
                          <span className="text-sm">{transaction.shopName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{transaction.buyerName}</span>
                          <span className="text-xs text-gray-500">{transaction.buyerEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-forest-dark">
                        {formatCurrency(transaction.platformFee)}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(transaction.nonprofitDonation)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(transaction.sellerPayout)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={transaction.status} />
                      </TableCell>
                      <TableCell>
                        {getPayoutBadge(transaction.payoutId, transaction.payoutStatus)}
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
          <CardTitle className="text-base">Understanding Transactions</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-3 text-sm">
          <p>
            <strong>Gross Amount:</strong> The total amount paid by the customer for items from this
            shop (excluding shipping and tax).
          </p>
          <p>
            <strong>Platform Fee:</strong> 6.5% of the gross amount, retained by the platform for
            service costs.
          </p>
          <p>
            <strong>Nonprofit Donation:</strong> The seller&apos;s committed donation percentage,
            deducted from their payout.
          </p>
          <p>
            <strong>Seller Net:</strong> The amount the seller receives: Gross - Platform Fee -
            Donation.
          </p>
          <p>
            <strong>Payout Status:</strong> &ldquo;Upcoming&rdquo; means funds are in the next
            payout. &ldquo;Paid Out&rdquo; means included in a completed payout.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
