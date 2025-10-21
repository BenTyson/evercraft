'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
              ${stats.totalAmount.toFixed(2)} total
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
              ${stats.paidAmount.toFixed(2)} paid out
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
            <div className="py-12 text-center">
              <p className="text-gray-500">No payouts yet</p>
              <p className="mt-2 text-sm text-gray-400">
                Payouts will appear here once sellers complete their first sales
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Seller
                    </th>
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {payout.shopLogo ? (
                            <img
                              src={payout.shopLogo}
                              alt={payout.shopName}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                              <span className="text-xs font-medium text-gray-600">
                                {payout.shopName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{payout.shopName}</p>
                            <p className="text-xs text-gray-500">{payout.ownerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(payout.periodStart), 'MMM d')} -{' '}
                        {format(new Date(payout.periodEnd), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3">{payout.transactionCount}</td>
                      <td className="px-4 py-3 font-medium">${payout.amount.toFixed(2)}</td>
                      <td className="px-4 py-3">{getStatusBadge(payout.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {payout.paidAt ? format(new Date(payout.paidAt), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" title="View details">
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
