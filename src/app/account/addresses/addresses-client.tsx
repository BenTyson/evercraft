'use client';

import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddressCard } from '@/components/account/address-card';
import { AddressFormDialog } from '@/components/account/address-form-dialog';
import { useRouter } from 'next/navigation';

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

interface AddressesClientProps {
  initialAddresses: Address[];
}

export function AddressesClient({ initialAddresses }: AddressesClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(undefined);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingAddress(undefined);
    }
  };

  // Separate shipping and billing addresses
  const shippingAddresses = initialAddresses.filter((a) => a.type === 'SHIPPING');
  const billingAddresses = initialAddresses.filter((a) => a.type === 'BILLING');

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">
            My Addresses
          </h1>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 size-4" />
            Add Address
          </Button>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-8">
        {/* Empty State */}
        {initialAddresses.length === 0 && (
          <div className="border-muted bg-card mx-auto max-w-md rounded-lg border p-12 text-center">
            <MapPin className="text-muted-foreground mx-auto mb-4 size-16" />
            <h2 className="mb-2 text-xl font-bold">No addresses saved</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Add your first shipping or billing address to speed up checkout
            </p>
            <Button onClick={handleAddNew} size="lg">
              <Plus className="mr-2 size-4" />
              Add Your First Address
            </Button>
          </div>
        )}

        {/* Shipping Addresses */}
        {shippingAddresses.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Shipping Addresses</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shippingAddresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={handleEdit}
                  onUpdate={handleSuccess}
                />
              ))}
            </div>
          </div>
        )}

        {/* Billing Addresses */}
        {billingAddresses.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Billing Addresses</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {billingAddresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={handleEdit}
                  onUpdate={handleSuccess}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Address Dialog */}
      <AddressFormDialog
        address={editingAddress}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
