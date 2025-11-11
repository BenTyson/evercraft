'use client';

import { useEffect, useState, useTransition } from 'react';
import { Heart, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import {
  getPlatformDefaultNonprofitAction,
  setPlatformDefaultNonprofitAction,
} from '@/actions/platform-settings';
import { getAllNonprofits, type NonprofitWithStats } from '@/actions/admin-nonprofits';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CurrentNonprofit {
  id: string;
  name: string;
  logo: string | null;
  mission: string;
  category: string[];
  isVerified: boolean;
}

export function PlatformDefaultSelector() {
  const [currentNonprofit, setCurrentNonprofit] = useState<CurrentNonprofit | null>(null);
  const [allNonprofits, setAllNonprofits] = useState<NonprofitWithStats[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Load current default nonprofit
      const defaultResult = await getPlatformDefaultNonprofitAction();
      if (defaultResult.success && defaultResult.nonprofit) {
        setCurrentNonprofit(defaultResult.nonprofit);
        setSelectedId(defaultResult.nonprofit.id);
      }

      // Load all verified nonprofits
      const nonprofitsResult = await getAllNonprofits({
        isVerified: true,
        pageSize: 100,
      });
      if (nonprofitsResult.success && nonprofitsResult.nonprofits) {
        setAllNonprofits(nonprofitsResult.nonprofits);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!selectedId) {
      setMessage({ type: 'error', text: 'Please select a nonprofit' });
      return;
    }

    startTransition(async () => {
      const result = await setPlatformDefaultNonprofitAction(selectedId);
      if (result.success) {
        setMessage({ type: 'success', text: 'Platform default nonprofit updated successfully' });
        // Reload to show updated nonprofit details
        await loadData();
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update' });
      }
    });
  }

  if (loading) {
    return (
      <div className="mb-8 rounded-lg border bg-white p-6">
        <div className="animate-pulse">
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-96 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Heart className="text-eco-dark size-5" />
            Platform Default Nonprofit
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Receives 1.5% of every transaction when sellers haven&apos;t selected their own
            nonprofit
          </p>
        </div>
      </div>

      {/* Current Default */}
      {currentNonprofit && (
        <div className="bg-eco-light/20 mt-4 rounded-lg p-4">
          <div className="flex items-center gap-4">
            {currentNonprofit.logo && (
              <Image
                src={currentNonprofit.logo}
                alt={currentNonprofit.name}
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                {currentNonprofit.name}
                {currentNonprofit.isVerified && (
                  <Check className="text-eco-dark size-4" aria-label="Verified" />
                )}
              </h3>
              <p className="text-sm text-gray-600">{currentNonprofit.mission}</p>
              {currentNonprofit.category && currentNonprofit.category.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {currentNonprofit.category.map((cat: string) => (
                    <span
                      key={cat}
                      className="bg-eco-light text-eco-dark rounded-full px-2 py-0.5 text-xs font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Selector */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Change Platform Default
          </label>
          <div className="flex gap-3">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a nonprofit" />
              </SelectTrigger>
              <SelectContent>
                {allNonprofits.map((nonprofit) => (
                  <SelectItem key={nonprofit.id} value={nonprofit.id}>
                    <div className="flex items-center gap-2">
                      <span>{nonprofit.name}</span>
                      {nonprofit.isVerified && (
                        <Check className="text-eco-dark size-3" aria-label="Verified" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleSave} disabled={isPending || !selectedId}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="size-4" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Info */}
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <p className="font-medium">How it works:</p>
          <ul className="mt-1 list-inside list-disc space-y-1">
            <li>1.5% of every transaction is donated to nonprofits from the platform fee (6.5%)</li>
            <li>If a seller has selected a nonprofit, that nonprofit receives the 1.5%</li>
            <li>If no nonprofit is selected, this default nonprofit receives the 1.5%</li>
            <li>Platform net revenue: 5.0% (6.5% - 1.5%)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
