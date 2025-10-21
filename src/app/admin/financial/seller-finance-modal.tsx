'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DollarSign, Receipt, TrendingUp } from 'lucide-react';

type ModalTab = 'overview' | 'payouts' | 'transactions';

interface SellerFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: {
    shop: {
      id: string;
      name: string;
      logo: string | null;
      ownerName: string | null;
      ownerEmail: string;
    };
    balance: {
      availableBalance: number;
      pendingBalance: number;
      totalEarned: number;
      totalPaidOut: number;
    };
    stats: {
      payoutCount: number;
      thisMonthEarnings: number;
      thisMonthOrders: number;
    };
    payouts: Array<{
      id: string;
      amount: number;
      status: string;
      transactionCount: number;
      periodStart: Date;
      periodEnd: Date;
      createdAt: Date;
      paidAt: Date | null;
    }>;
    transactions: Array<{
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
      createdAt: Date;
    }>;
  } | null;
}

export default function SellerFinanceModal({ isOpen, onClose, details }: SellerFinanceModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');

  if (!details) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'PAID':
        return <Badge variant="default">Paid</Badge>;
      case 'pending':
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline">Processing</Badge>;
      case 'failed':
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {details.shop.logo ? (
              <img
                src={details.shop.logo}
                alt={details.shop.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                <span className="text-lg font-medium text-gray-600">
                  {details.shop.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <DialogTitle>{details.shop.name}</DialogTitle>
              <DialogDescription>
                {details.shop.ownerName && `${details.shop.ownerName} - `}
                {details.shop.ownerEmail}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4" aria-label="Modal Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-forest-dark text-forest-dark'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === 'payouts'
                  ? 'border-forest-dark text-forest-dark'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Payouts
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === 'transactions'
                  ? 'border-forest-dark text-forest-dark'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Transactions
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Balance Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available</CardTitle>
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${details.balance.availableBalance.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${details.balance.pendingBalance.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                    <TrendingUp className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${details.balance.totalEarned.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
                    <Receipt className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${details.balance.totalPaidOut.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{details.stats.payoutCount}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">This Month Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${details.stats.thisMonthEarnings.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">This Month Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{details.stats.thisMonthOrders}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Payouts Tab */}
          {activeTab === 'payouts' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                {details.payouts.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">No payouts yet</p>
                ) : (
                  <div className="space-y-3">
                    {details.payouts.map((payout) => (
                      <div
                        key={payout.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div>
                          <p className="font-medium">
                            {format(new Date(payout.periodStart), 'MMM d')} -{' '}
                            {format(new Date(payout.periodEnd), 'MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {payout.transactionCount} transactions
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${payout.amount.toFixed(2)}</p>
                          {getStatusBadge(payout.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {details.transactions.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {details.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{transaction.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(transaction.orderDate), 'MMM d, yyyy')} -{' '}
                            {transaction.buyerName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${transaction.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            Net: ${transaction.sellerPayout.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
