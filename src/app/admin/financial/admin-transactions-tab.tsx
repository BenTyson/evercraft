'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="default">Paid</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'REFUNDED':
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
            <span className="font-medium">${summary.totalGross.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Total Platform Fees:</span>
            <span className="text-forest-dark font-medium">${summary.totalFees.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Total Nonprofit Donations:</span>
            <span className="font-medium text-green-600">${summary.totalDonations.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="font-semibold">Total Seller Payouts:</span>
            <span className="text-lg font-bold">${summary.totalNet.toFixed(2)}</span>
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
            <div className="py-12 text-center">
              <p className="text-gray-500">No transactions yet</p>
              <p className="mt-2 text-sm text-gray-400">
                Transactions will appear here when customers make purchases
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Order #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Shop</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gross</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Platform Fee
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Donation
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Seller Net
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Payout Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{transaction.orderNumber}</td>
                      <td className="px-4 py-3 text-sm">
                        {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {transaction.shopLogo ? (
                            <img
                              src={transaction.shopLogo}
                              alt={transaction.shopName}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                              <span className="text-xs font-medium text-gray-600">
                                {transaction.shopName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-sm">{transaction.shopName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm">{transaction.buyerName}</span>
                          <span className="text-xs text-gray-500">{transaction.buyerEmail}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">${transaction.amount.toFixed(2)}</td>
                      <td className="text-forest-dark px-4 py-3">
                        ${transaction.platformFee.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-green-600">
                        ${transaction.nonprofitDonation.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        ${transaction.sellerPayout.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(transaction.status)}</td>
                      <td className="px-4 py-3">
                        {getPayoutBadge(transaction.payoutId, transaction.payoutStatus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
