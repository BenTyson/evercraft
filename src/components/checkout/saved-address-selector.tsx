'use client';

import { useState, useEffect } from 'react';
import { MapPin, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getUserAddresses } from '@/actions/addresses';
import { cn } from '@/lib/utils';

interface Address {
  id: string;
  type: string;
  firstName: string;
  lastName: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

interface SavedAddressSelectorProps {
  onSelectAddress: (address: Address | null) => void;
  selectedAddressId?: string | null;
}

export function SavedAddressSelector({
  onSelectAddress,
  selectedAddressId,
}: SavedAddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    const result = await getUserAddresses();
    if (result.success && result.addresses) {
      const shippingAddresses = result.addresses.filter((a) => a.type === 'SHIPPING');
      setAddresses(shippingAddresses);

      // Auto-select default address if no address is selected yet
      if (!selectedAddressId) {
        const defaultAddress = shippingAddresses.find((a) => a.isDefault);
        if (defaultAddress) {
          onSelectAddress(defaultAddress);
        }
      }
    }
    setLoading(false);
  };

  const handleSelectAddress = (address: Address) => {
    onSelectAddress(address);
    setShowManualEntry(false);
  };

  const handleManualEntry = () => {
    onSelectAddress(null);
    setShowManualEntry(true);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <p className="text-muted-foreground text-sm">Loading saved addresses...</p>
      </div>
    );
  }

  if (addresses.length === 0) {
    return null; // Don't show anything if no saved addresses
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Choose a saved address</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleManualEntry}
          className={cn(showManualEntry && 'bg-muted')}
        >
          <Plus className="mr-1.5 size-4" />
          Enter New Address
        </Button>
      </div>

      {!showManualEntry && (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address.id;
            return (
              <Card
                key={address.id}
                className={cn(
                  'hover:border-forest-dark relative cursor-pointer p-4 transition-colors',
                  isSelected && 'border-forest-dark bg-forest-light/5 border-2'
                )}
                onClick={() => handleSelectAddress(address)}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="bg-forest-dark absolute top-3 right-3 flex size-6 items-center justify-center rounded-full text-white">
                    <Check className="size-4" />
                  </div>
                )}

                {/* Default Badge */}
                {address.isDefault && !isSelected && (
                  <div className="bg-muted text-muted-foreground absolute top-3 right-3 rounded-full px-2 py-0.5 text-xs font-medium">
                    Default
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <MapPin className="size-5" />
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="mb-1 font-semibold">
                      {address.firstName} {address.lastName}
                    </div>
                    <div className="text-muted-foreground space-y-0.5">
                      {address.company && <div>{address.company}</div>}
                      <div>{address.address1}</div>
                      {address.address2 && <div>{address.address2}</div>}
                      <div>
                        {address.city}, {address.state} {address.postalCode}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showManualEntry && (
        <p className="text-muted-foreground text-sm">
          Fill out the form below to enter a new shipping address
        </p>
      )}
    </div>
  );
}
