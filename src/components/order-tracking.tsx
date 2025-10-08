'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Package, Loader2 } from 'lucide-react';
import { getTrackingInfo } from '@/actions/shipping';

interface OrderTrackingProps {
  orderId: string;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
}

interface TrackingEvent {
  status: string;
  statusDetails?: string;
  statusDate?: string;
  location?: {
    city?: string;
    state?: string;
  };
}

interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  status: string;
  eta?: string;
  trackingHistory?: TrackingEvent[];
}

export function OrderTracking({ orderId, trackingNumber }: OrderTrackingProps) {
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackingNumber) return;

    const fetchTracking = async () => {
      setLoading(true);
      setError(null);

      const result = await getTrackingInfo(orderId);

      if (result.success && result.tracking) {
        setTracking(result.tracking);
      } else if (result.error) {
        setError(result.error);
      }

      setLoading(false);
    };

    fetchTracking();
  }, [orderId, trackingNumber]);

  if (!trackingNumber) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Package className="size-5" />
          Tracking Information
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading tracking info...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Package className="size-5" />
          Tracking Information
        </h2>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!tracking) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <Package className="size-5" />
        Tracking Information
      </h2>

      <div className="space-y-4">
        {/* Tracking Number */}
        <div>
          <p className="text-sm text-gray-600">Tracking Number</p>
          <p className="font-mono text-lg font-semibold">{tracking.trackingNumber}</p>
        </div>

        {/* Carrier */}
        {tracking.carrier && (
          <div>
            <p className="text-sm text-gray-600">Carrier</p>
            <p className="font-semibold">{tracking.carrier}</p>
          </div>
        )}

        {/* Status */}
        {tracking.status && (
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-semibold capitalize">{tracking.status}</p>
          </div>
        )}

        {/* Status Details */}
        {tracking.statusDetails && (
          <div>
            <p className="text-sm text-gray-600">Details</p>
            <p className="text-sm">{tracking.statusDetails}</p>
          </div>
        )}

        {/* ETA */}
        {tracking.eta && (
          <div>
            <p className="text-sm text-gray-600">Estimated Delivery</p>
            <p className="font-semibold">
              {new Date(tracking.eta).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        )}

        {/* Tracking History */}
        {tracking.trackingHistory && tracking.trackingHistory.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-600">Tracking History</p>
            <div className="space-y-2">
              {tracking.trackingHistory.map((event, index) => (
                <div key={index} className="border-l-2 border-gray-300 pb-2 pl-4">
                  <p className="text-sm font-medium">{event.statusDetails || event.status}</p>
                  <p className="text-xs text-gray-500">
                    {event.location && `${event.location.city}, ${event.location.state} • `}
                    {event.statusDate &&
                      new Date(event.statusDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Track Package Link */}
        {tracking.carrier && tracking.trackingNumber && (
          <a
            href={`https://www.google.com/search?q=${tracking.carrier}+tracking+${tracking.trackingNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <ExternalLink className="size-4" />
            Track Package
          </a>
        )}
      </div>
    </div>
  );
}
