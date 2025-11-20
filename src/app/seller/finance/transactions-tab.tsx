'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
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
            <EmptyState
              title="No transactions yet"
              description="Transactions will appear here when customers purchase from your shop"
            />
          ) : (
            <TableContainer>
              <table className="w-full">
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Order #</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Gross</TableHeaderCell>
                    <TableHeaderCell>Platform Fee</TableHeaderCell>
                    <TableHeaderCell>Donation</TableHeaderCell>
                    <TableHeaderCell>Net Payout</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Payout Status</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.orderNumber}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(transaction.orderDate), 'MMM d, yyyy')}
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
                      <TableCell className="text-red-600">
                        -{formatCurrency(transaction.platformFee)}
                      </TableCell>
                      <TableCell className="text-green-600">
                        -{formatCurrency(transaction.nonprofitDonation)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(transaction.sellerPayout)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={transaction.status} />
                      </TableCell>
                      <TableCell>{getPayoutStatusBadge(transaction.payoutId)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </table>
            </TableContainer>
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
                {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Platform Fees:</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(transactions.reduce((sum, t) => sum + t.platformFee, 0))}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Nonprofit Donations:</span>
              <span className="font-medium text-green-600">
                -{formatCurrency(transactions.reduce((sum, t) => sum + t.nonprofitDonation, 0))}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold">Total Net Earnings:</span>
              <span className="text-lg font-bold">
                {formatCurrency(transactions.reduce((sum, t) => sum + t.sellerPayout, 0))}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
