'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ExternalLink, Receipt, Calendar, TrendingUp } from 'lucide-react';

interface PayoutDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payout: {
    id: string;
    shopId: string;
    shopName: string;
    shopLogo: string | null;
    amount: number;
    status: string;
    transactionCount: number;
    periodStart: Date;
    periodEnd: Date;
    createdAt: Date;
    paidAt: Date | null;
    stripePayoutId: string | null;
    failureReason: string | null;
    payments: Array<{
      id: string;
      orderNumber: string;
      buyerName: string;
      buyerEmail: string;
      amount: number;
      platformFee: number;
      nonprofitDonation: number;
      sellerPayout: number;
      createdAt: Date;
    }>;
  } | null;
}

export default function PayoutDetailsModal({ isOpen, onClose, payout }: PayoutDetailsModalProps) {
  if (!payout) return null;

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

  // Calculate payment totals
  const totals = payout.payments.reduce(
    (acc, payment) => ({
      gross: acc.gross + payment.amount,
      fees: acc.fees + payment.platformFee,
      donations: acc.donations + payment.nonprofitDonation,
      net: acc.net + payment.sellerPayout,
    }),
    { gross: 0, fees: 0, donations: 0, net: 0 }
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {payout.shopLogo ? (
              <img
                src={payout.shopLogo}
                alt={payout.shopName}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                <span className="text-lg font-medium text-gray-600">
                  {payout.shopName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <DialogTitle>Payout Details - {payout.shopName}</DialogTitle>
              <DialogDescription>
                {format(new Date(payout.periodStart), 'MMM d')} -{' '}
                {format(new Date(payout.periodEnd), 'MMM d, yyyy')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payout Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payout Amount</CardTitle>
                <Receipt className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${payout.amount.toFixed(2)}</div>
                {getStatusBadge(payout.status)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payout.transactionCount}</div>
                <p className="text-muted-foreground mt-1 text-xs">Included orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Created</CardTitle>
                <Calendar className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {format(new Date(payout.createdAt), 'MMM d, yyyy')}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {format(new Date(payout.createdAt), 'h:mm a')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid On</CardTitle>
                <Calendar className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {payout.paidAt ? format(new Date(payout.paidAt), 'MMM d, yyyy') : 'Pending'}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {payout.paidAt && format(new Date(payout.paidAt), 'h:mm a')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stripe Info */}
          {payout.stripePayoutId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stripe Payout Information</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stripe Payout ID:</p>
                  <p className="font-mono text-sm">{payout.stripePayoutId}</p>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View in Stripe
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Failure Reason */}
          {payout.status === 'failed' && payout.failureReason && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-base text-red-800">Payout Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">{payout.failureReason}</p>
              </CardContent>
            </Card>
          )}

          {/* Payment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Breakdown</CardTitle>
              <CardDescription>All transactions included in this payout</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Summary */}
              <div className="mb-4 rounded-lg border bg-gray-50 p-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Gross Revenue:</span>
                    <span className="font-medium">${totals.gross.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fees (6.5%):</span>
                    <span className="text-forest-dark font-medium">-${totals.fees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nonprofit Donations:</span>
                    <span className="font-medium text-green-600">
                      -${totals.donations.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Net Payout:</span>
                    <span className="text-lg">${totals.net.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment List */}
              <div className="space-y-2">
                {payout.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{payment.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(payment.createdAt), 'MMM d, yyyy')} - {payment.buyerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        Net: ${payment.sellerPayout.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
