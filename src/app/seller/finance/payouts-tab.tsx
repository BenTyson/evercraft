'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Download, ExternalLink } from 'lucide-react';

interface Payout {
  id: string;
  amount: number;
  status: string;
  transactionCount: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  paidAt: Date | null;
}

interface PayoutsTabProps {
  payouts: Payout[];
}

export default function PayoutsTab({ payouts }: PayoutsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>View and download details of your past payouts</CardDescription>
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
              description="Payouts are processed weekly every Monday"
            />
          ) : (
            <TableContainer>
              <table className="w-full">
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Date</TableHeaderCell>
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
                      <TableCell className="text-sm text-gray-600">
                        {format(new Date(payout.periodStart), 'MMM d')} -{' '}
                        {format(new Date(payout.periodEnd), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{payout.transactionCount}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(payout.amount)}</TableCell>
                      <TableCell>
                        <StatusBadge status={payout.status} />
                      </TableCell>
                      <TableCell>
                        {payout.paidAt ? format(new Date(payout.paidAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Button variant="ghost" size="sm">
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
            <strong>Payout Schedule:</strong> Payouts are automatically processed every Monday for
            the previous week&apos;s earnings.
          </p>
          <p>
            <strong>Bank Transfer Time:</strong> Once initiated, payouts typically arrive in your
            bank account within 5-7 business days.
          </p>
          <p>
            <strong>Minimum Payout:</strong> No minimum payout amount is required.
          </p>
          <p>
            <strong>Fees:</strong> Platform fees (6.5%) and your committed nonprofit donation are
            deducted before payouts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
