'use client';

import { useState } from 'react';
import { MapPin, Edit, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { deleteAddress, setDefaultAddress } from '@/actions/addresses';
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

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onUpdate: () => void;
}

export function AddressCard({ address, onEdit, onUpdate }: AddressCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await deleteAddress(address.id);

      if (result.success) {
        onUpdate();
      } else {
        setError(result.error || 'Failed to delete address');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Delete address error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await setDefaultAddress(address.id);

      if (result.success) {
        onUpdate();
      } else {
        setError(result.error || 'Failed to set default address');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Set default address error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn('relative p-6', address.isDefault && 'border-forest-dark border-2')}>
      {/* Default Badge */}
      {address.isDefault && (
        <div className="bg-forest-dark absolute top-4 right-4 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white">
          <Star className="size-3 fill-current" />
          Default
        </div>
      )}

      {/* Type Badge */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <MapPin className="size-5" />
        </div>
        <div>
          <div className="font-semibold">
            {address.type === 'SHIPPING' ? 'Shipping Address' : 'Billing Address'}
          </div>
          <div className="text-muted-foreground text-sm">
            {address.firstName} {address.lastName}
          </div>
        </div>
      </div>

      {/* Address Details */}
      <div className="text-muted-foreground mb-6 space-y-1 text-sm">
        {address.company && <div>{address.company}</div>}
        <div>{address.address1}</div>
        {address.address2 && <div>{address.address2}</div>}
        <div>
          {address.city}, {address.state} {address.postalCode}
        </div>
        <div>{address.country}</div>
        {address.phone && <div className="mt-2">Phone: {address.phone}</div>}
      </div>

      {/* Error Message */}
      {error && <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">{error}</div>}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(address)} disabled={loading}>
          <Edit className="mr-1.5 size-4" />
          Edit
        </Button>

        {!address.isDefault && (
          <Button variant="outline" size="sm" onClick={handleSetDefault} disabled={loading}>
            <Star className="mr-1.5 size-4" />
            Set as Default
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
          className="hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="mr-1.5 size-4" />
          Delete
        </Button>
      </div>
    </Card>
  );
}
