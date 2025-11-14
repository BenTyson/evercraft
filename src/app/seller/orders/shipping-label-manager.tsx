'use client';

import { useState, useTransition } from 'react';
import { Package, Truck, ExternalLink, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getShippingRates, createShippingLabel, voidShippingLabel } from '@/actions/shipping';

interface ShippingLabelManagerProps {
  orderId: string;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
  shippingLabelUrl?: string | null;
  onLabelCreated?: () => void;
}

interface ShippingRate {
  objectId: string;
  provider: string;
  servicelevel: { name: string };
  amount: number;
  currency: string;
  estimatedDays: number;
}

interface ShippingProfile {
  name: string;
  originAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export function ShippingLabelManager({
  orderId,
  trackingNumber,
  trackingCarrier,
  shippingLabelUrl,
  onLabelCreated,
}: ShippingLabelManagerProps) {
  const [showRates, setShowRates] = useState(false);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [shippingProfile, setShippingProfile] = useState<ShippingProfile | null>(null);
  const [selectedRate, setSelectedRate] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleGetRates = async () => {
    setError(null);
    startTransition(async () => {
      const result = await getShippingRates(orderId);
      if (result.success && result.rates) {
        setRates(result.rates);
        setShippingProfile(result.shippingProfile || null);
        setShowRates(true);
      } else {
        setError(result.error || 'Failed to fetch shipping rates');
      }
    });
  };

  const handleCreateLabel = async () => {
    if (!selectedRate) {
      setError('Please select a shipping rate');
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createShippingLabel({
        orderId,
        rateId: selectedRate,
      });

      if (result.success) {
        setShowRates(false);
        setRates([]);
        setSelectedRate(null);
        onLabelCreated?.();
      } else {
        setError(result.error || 'Failed to create shipping label');
      }
    });
  };

  const handleVoidLabel = async () => {
    if (!confirm('Are you sure you want to void this shipping label? This cannot be undone.')) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await voidShippingLabel(orderId);
      if (result.success) {
        onLabelCreated?.();
      } else {
        setError(result.error || 'Failed to void shipping label');
      }
    });
  };

  // If label already exists, show tracking info and label link
  if (trackingNumber && shippingLabelUrl) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Truck className="size-5 text-green-700" />
          <h4 className="font-semibold text-green-900">Shipping Label Created</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-green-700">Tracking Number:</span>{' '}
            <span className="font-mono font-semibold text-green-900">{trackingNumber}</span>
          </div>
          {trackingCarrier && (
            <div>
              <span className="text-green-700">Carrier:</span>{' '}
              <span className="font-semibold text-green-900">{trackingCarrier}</span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <a
              href={shippingLabelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded bg-green-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-800"
            >
              <ExternalLink className="size-3" />
              View Label
            </a>
            <Button
              size="sm"
              variant="outline"
              onClick={handleVoidLabel}
              disabled={isPending}
              className="border-red-300 text-xs text-red-700 hover:bg-red-50"
            >
              <XCircle className="mr-1 size-3" />
              Void Label
            </Button>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // Show rate selection UI
  if (showRates && rates.length > 0) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-blue-900">Select Shipping Rate</h4>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowRates(false)}
            className="text-xs text-blue-700"
          >
            Cancel
          </Button>
        </div>
        {shippingProfile && (
          <div className="mb-3 rounded border border-blue-300 bg-white p-3">
            <div className="mb-1 text-xs font-medium text-blue-700">Label will ship from:</div>
            <div className="text-sm font-semibold text-gray-900">{shippingProfile.name}</div>
            <div className="text-xs text-gray-600">
              {shippingProfile.originAddress.street && (
                <div>{shippingProfile.originAddress.street}</div>
              )}
              <div>
                {shippingProfile.originAddress.city}, {shippingProfile.originAddress.state}{' '}
                {shippingProfile.originAddress.zip}
              </div>
            </div>
          </div>
        )}
        <div className="mb-3 space-y-2">
          {rates.map((rate) => (
            <label
              key={rate.objectId}
              className="flex cursor-pointer items-center justify-between rounded border border-blue-200 bg-white p-3 transition-colors hover:border-blue-400 hover:bg-blue-50"
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping-rate"
                  value={rate.objectId}
                  checked={selectedRate === rate.objectId}
                  onChange={(e) => setSelectedRate(e.target.value)}
                  className="size-4"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {rate.provider} - {rate.servicelevel.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {rate.estimatedDays} {rate.estimatedDays === 1 ? 'day' : 'days'}
                  </div>
                </div>
              </div>
              <div className="font-semibold text-blue-900">${rate.amount.toFixed(2)}</div>
            </label>
          ))}
        </div>
        <Button
          onClick={handleCreateLabel}
          disabled={!selectedRate || isPending}
          className="w-full bg-blue-700 hover:bg-blue-800"
        >
          {isPending ? 'Creating Label...' : 'Create Shipping Label'}
        </Button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // Show "Get Rates" button
  return (
    <div>
      <Button
        onClick={handleGetRates}
        disabled={isPending}
        variant="outline"
        size="sm"
        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
      >
        <Package className="mr-2 size-4" />
        {isPending ? 'Loading Rates...' : 'Create Shipping Label'}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
