'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getConnectedAccountStatus,
  createConnectAccount,
  createOnboardingLink,
  createLoginLink,
  updatePayoutSchedule,
  getPayoutSchedule,
} from '@/actions/stripe-connect';
import { getSeller1099Data } from '@/actions/seller-finance';
import { ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ConnectedAccountStatus {
  success: boolean;
  exists?: boolean;
  connected?: boolean;
  accountId?: string;
  onboardingCompleted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  stripeNotConfigured?: boolean;
  requirementsCurrentlyDue?: string[];
  requirementsEventuallyDue?: string[];
  error?: string;
}

interface Tax1099Data {
  taxYear: number;
  grossPayments: number;
  transactionCount: number;
  reportingRequired: boolean;
}

export default function SettingsTabContent() {
  const [accountStatus, setAccountStatus] = useState<ConnectedAccountStatus | null>(null);
  const [payoutSchedule, setPayoutSchedule] = useState<string>('weekly');
  const [tax1099Data, setTax1099Data] = useState<Tax1099Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusResult, scheduleResult, taxDataResult] = await Promise.all([
        getConnectedAccountStatus(),
        getPayoutSchedule(),
        getSeller1099Data(),
      ]);

      if (statusResult.success) {
        setAccountStatus(statusResult);
      }

      if (scheduleResult.success && scheduleResult.schedule) {
        setPayoutSchedule(scheduleResult.schedule);
      }

      if (taxDataResult.success && taxDataResult.data) {
        setTax1099Data(taxDataResult.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setActionLoading(true);
    try {
      const result = await createConnectAccount();
      if (result.success) {
        setAlertMessage({
          type: 'success',
          message: 'Stripe account created. Redirecting to onboarding...',
        });
        await handleStartOnboarding();
      } else {
        setAlertMessage({ type: 'error', message: result.error || 'Failed to create account' });
      }
    } catch (error) {
      console.error('Error creating account:', error);
      setAlertMessage({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartOnboarding = async () => {
    setActionLoading(true);
    try {
      const returnUrl = `${window.location.origin}/seller/finance?tab=settings`;
      const refreshUrl = `${window.location.origin}/seller/finance?tab=settings&refresh=true`;

      const result = await createOnboardingLink(returnUrl, refreshUrl);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        setAlertMessage({
          type: 'error',
          message: result.error || 'Failed to create onboarding link',
        });
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      setAlertMessage({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    setActionLoading(true);
    try {
      const result = await createLoginLink();
      if (result.success && result.url) {
        window.open(result.url, '_blank');
      } else {
        setAlertMessage({ type: 'error', message: result.error || 'Failed to open dashboard' });
      }
    } catch (error) {
      console.error('Error opening dashboard:', error);
      setAlertMessage({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSchedule = async (newSchedule: 'daily' | 'weekly' | 'monthly') => {
    try {
      const result = await updatePayoutSchedule(newSchedule);
      if (result.success) {
        setPayoutSchedule(newSchedule);
        setAlertMessage({ type: 'success', message: 'Payout schedule updated' });
      } else {
        setAlertMessage({ type: 'error', message: result.error || 'Failed to update schedule' });
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      setAlertMessage({ type: 'error', message: 'An unexpected error occurred' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Message */}
      {alertMessage && (
        <div
          className={`rounded-md p-4 ${alertMessage.type === 'success' ? 'border border-green-200 bg-green-50 text-green-800' : 'border border-red-200 bg-red-50 text-red-800'}`}
        >
          <p className="text-sm">{alertMessage.message}</p>
          <button onClick={() => setAlertMessage(null)} className="mt-1 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Stripe Connect Account */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Account</CardTitle>
          <CardDescription>Connect your bank account to receive payouts via Stripe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accountStatus?.stripeNotConfigured ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Stripe not configured
                  </p>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Bank account connections are not available yet. The platform administrator needs
                    to configure Stripe Connect. You can still view your balance and transactions.
                  </p>
                </div>
              </div>
            </div>
          ) : !accountStatus?.exists ? (
            <div className="space-y-4">
              <div className="bg-muted flex items-start gap-3 rounded-lg p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium">Bank account not connected</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    You need to connect a bank account through Stripe to receive payouts.
                  </p>
                </div>
              </div>
              <Button onClick={handleCreateAccount} disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Connect Bank Account'
                )}
              </Button>
            </div>
          ) : !accountStatus.onboardingCompleted ? (
            <div className="space-y-4">
              <div className="bg-muted flex items-start gap-3 rounded-lg p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium">Onboarding incomplete</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Complete your Stripe onboarding to start receiving payouts.
                  </p>
                </div>
              </div>
              <Button onClick={handleStartOnboarding} disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Complete Onboarding'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Bank account connected
                  </p>
                  <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                    Your account is set up and ready to receive payouts.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleOpenDashboard} disabled={actionLoading}>
                  {actionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  View Stripe Dashboard
                </Button>

                {(accountStatus.requirementsCurrentlyDue?.length ?? 0) > 0 && (
                  <Button onClick={handleStartOnboarding} disabled={actionLoading}>
                    Update Information
                  </Button>
                )}
              </div>

              {(accountStatus.requirementsCurrentlyDue?.length ?? 0) > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Action required
                  </p>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                    Additional information is needed to keep your account active.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Schedule</CardTitle>
          <CardDescription>Choose how often you want to receive payouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Frequency</label>
            <Select value={payoutSchedule} onValueChange={handleUpdateSchedule}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly (Recommended)</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-muted-foreground space-y-2 text-sm">
            <p>
              <strong>Daily:</strong> Payouts processed every business day
            </p>
            <p>
              <strong>Weekly:</strong> Payouts processed every Monday (Default)
            </p>
            <p>
              <strong>Monthly:</strong> Payouts processed on the first Monday of each month
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 1099-K Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Information (1099-K)</CardTitle>
          <CardDescription>
            Track your annual earnings toward 1099-K reporting threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tax1099Data && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground text-sm">Tax Year:</span>
                  <span className="font-medium">{tax1099Data.taxYear}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground text-sm">Gross Payments:</span>
                  <span className="font-medium">${tax1099Data.grossPayments.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground text-sm">Transaction Count:</span>
                  <span className="font-medium">{tax1099Data.transactionCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">1099-K Required:</span>
                  {tax1099Data.reportingRequired ? (
                    <Badge variant="default">Yes</Badge>
                  ) : (
                    <Badge variant="outline">Not yet</Badge>
                  )}
                </div>
              </div>

              <div className="bg-muted text-muted-foreground rounded-lg p-4 text-sm">
                <p>
                  <strong>Note:</strong> 1099-K forms are required if you receive $20,000 or more
                  AND 200+ transactions in a calendar year. Forms will be sent in January for the
                  previous year.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
