'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Download } from 'lucide-react';

interface Transaction {
  id: string;
  orderNumber: string;
  orderDate: Date;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  platformFee: number;
  nonprofitDonation: number;
  sellerPayout: number;
  status: string;
  payoutId: string | null;
}

interface TransactionsTabProps {
  transactions: Transaction[];
}

export default function TransactionsTab({ transactions }: TransactionsTabProps) {
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

  const getPayoutStatusBadge = (payoutId: string | null) => {
    if (!payoutId) {
      return <Badge variant="outline">Upcoming</Badge>;
    }
    return <Badge variant="default">Paid Out</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Detailed breakdown of all your orders and earnings</CardDescription>
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
                Transactions will appear here when customers purchase from your shop
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
                      Net Payout
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
                        {format(new Date(transaction.orderDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm">{transaction.buyerName}</span>
                          <span className="text-xs text-gray-500">{transaction.buyerEmail}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">${transaction.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-red-600">
                        -${transaction.platformFee.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-green-600">
                        -${transaction.nonprofitDonation.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        ${transaction.sellerPayout.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(transaction.status)}</td>
                      <td className="px-4 py-3">{getPayoutStatusBadge(transaction.payoutId)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Transactions:</span>
              <span className="font-medium">{transactions.length}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Gross Revenue:</span>
              <span className="font-medium">
                ${transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Platform Fees:</span>
              <span className="font-medium text-red-600">
                -$
                {transactions.reduce((sum, t) => sum + t.platformFee, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Nonprofit Donations:</span>
              <span className="font-medium text-green-600">
                -$
                {transactions.reduce((sum, t) => sum + t.nonprofitDonation, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold">Total Net Earnings:</span>
              <span className="text-lg font-bold">
                ${transactions.reduce((sum, t) => sum + t.sellerPayout, 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
