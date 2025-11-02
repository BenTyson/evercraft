'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getVerifiedNonprofits } from '@/actions/nonprofits';
import { useCheckoutStore } from '@/store/checkout-store';

interface Nonprofit {
  id: string;
  name: string;
  mission: string;
  logo: string | null;
  category: string[];
}

interface DonationSelectorProps {
  orderSubtotal: number;
}

export function DonationSelector({ orderSubtotal }: DonationSelectorProps) {
  const { buyerDonation, setBuyerDonation } = useCheckoutStore();
  const [nonprofits, setNonprofits] = useState<Nonprofit[]>([]);
  const [selectedNonprofitId, setSelectedNonprofitId] = useState<string>(
    buyerDonation?.nonprofitId || ''
  );
  const [customAmount, setCustomAmount] = useState<string>(buyerDonation?.amount?.toString() || '');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(!!buyerDonation);

  // Preset amounts
  const presetAmounts = [1, 5, 10, 25];

  // Calculate round up amount
  const roundUpAmount = Math.ceil(orderSubtotal) - orderSubtotal;
  const showRoundUp = roundUpAmount > 0.01 && roundUpAmount <= 0.99;

  // Load nonprofits
  useEffect(() => {
    async function loadNonprofits() {
      const result = await getVerifiedNonprofits();
      if (result.success) {
        setNonprofits(result.nonprofits);
      }
    }
    loadNonprofits();
  }, []);

  // Update checkout store when selection changes
  useEffect(() => {
    if (selectedNonprofitId && (customAmount || selectedPreset)) {
      const amount = customAmount ? parseFloat(customAmount) : selectedPreset || 0;
      const nonprofit = nonprofits.find((n) => n.id === selectedNonprofitId);

      if (amount > 0 && nonprofit) {
        setBuyerDonation({
          nonprofitId: selectedNonprofitId,
          nonprofitName: nonprofit.name,
          amount,
        });
      }
    } else {
      setBuyerDonation(null);
    }
  }, [selectedNonprofitId, customAmount, selectedPreset, nonprofits, setBuyerDonation]);

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount(amount.toString());
  };

  const handleRoundUpClick = () => {
    if (showRoundUp) {
      setSelectedPreset(null);
      setCustomAmount(roundUpAmount.toFixed(2));
    }
  };

  const handleCustomAmountChange = (value: string) => {
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value);
      setSelectedPreset(null);
    }
  };

  const handleRemoveDonation = () => {
    setSelectedNonprofitId('');
    setCustomAmount('');
    setSelectedPreset(null);
    setBuyerDonation(null);
    setIsExpanded(false);
  };

  const selectedNonprofit = nonprofits.find((n) => n.id === selectedNonprofitId);
  const donationAmount = customAmount ? parseFloat(customAmount) : 0;

  if (!isExpanded && !buyerDonation) {
    return (
      <div className="border-t pt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => setIsExpanded(true)}
        >
          <Heart className="text-eco-dark size-4" />
          <span>Add an optional donation</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="border-t pt-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="text-eco-dark size-5" />
          <h3 className="font-semibold">Support a Cause</h3>
        </div>
        {buyerDonation && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveDonation}
            className="text-xs"
          >
            Remove
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Nonprofit Selector */}
        <div>
          <label htmlFor="nonprofit" className="mb-1.5 block text-sm font-medium">
            Choose a nonprofit
          </label>
          <select
            id="nonprofit"
            value={selectedNonprofitId}
            onChange={(e) => setSelectedNonprofitId(e.target.value)}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="">Select a nonprofit...</option>
            {nonprofits.map((nonprofit) => (
              <option key={nonprofit.id} value={nonprofit.id}>
                {nonprofit.name}
              </option>
            ))}
          </select>
        </div>

        {selectedNonprofitId && selectedNonprofit && (
          <>
            {/* Nonprofit Info */}
            <div className="bg-eco-light/10 rounded-md p-3 text-sm">
              <div className="flex items-start gap-3">
                {selectedNonprofit.logo && (
                  <div className="relative size-10 flex-shrink-0 overflow-hidden rounded">
                    <Image
                      src={selectedNonprofit.logo}
                      alt={selectedNonprofit.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-eco-dark font-medium">{selectedNonprofit.name}</p>
                  <p className="text-muted-foreground mt-1 text-xs">{selectedNonprofit.mission}</p>
                </div>
              </div>
            </div>

            {/* Preset Amounts + Round Up */}
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={selectedPreset === amount ? 'default' : 'outline'}
                  onClick={() => handlePresetClick(amount)}
                  className="h-10"
                >
                  ${amount}
                </Button>
              ))}
              {showRoundUp && (
                <Button
                  type="button"
                  variant={
                    !selectedPreset && parseFloat(customAmount) === roundUpAmount
                      ? 'default'
                      : 'outline'
                  }
                  onClick={handleRoundUpClick}
                  className="h-10"
                >
                  ${roundUpAmount.toFixed(2)}
                </Button>
              )}
            </div>

            {/* Custom Amount */}
            <div>
              <label htmlFor="customAmount" className="mb-1.5 block text-sm font-medium">
                Or enter a custom amount
              </label>
              <div className="relative">
                <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                  $
                </span>
                <Input
                  id="customAmount"
                  type="text"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>

            {/* Impact Preview */}
            {donationAmount > 0 && (
              <div className="bg-eco-dark/5 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <Info className="text-eco-dark mt-0.5 size-4 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-eco-dark font-medium">
                      100% of your ${donationAmount.toFixed(2)} donation goes directly to{' '}
                      {selectedNonprofit.name}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Evercraft facilitates your donation and provides tax documentation.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
