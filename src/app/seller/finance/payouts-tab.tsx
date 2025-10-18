'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
            <div className="py-12 text-center">
              <p className="text-gray-500">No payouts yet</p>
              <p className="mt-2 text-sm text-gray-400">
                Payouts are processed weekly every Monday
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Period
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Orders
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Paid On
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {format(new Date(payout.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(payout.periodStart), 'MMM d')} -{' '}
                        {format(new Date(payout.periodEnd), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3">{payout.transactionCount}</td>
                      <td className="px-4 py-3 font-medium">${payout.amount.toFixed(2)}</td>
                      <td className="px-4 py-3">{getStatusBadge(payout.status)}</td>
                      <td className="px-4 py-3">
                        {payout.paidAt ? format(new Date(payout.paidAt), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
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
