'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createAddress, updateAddress, type AddressInput } from '@/actions/addresses';

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

interface AddressFormDialogProps {
  address?: Address;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

export function AddressFormDialog({
  address,
  open,
  onOpenChange,
  onSuccess,
}: AddressFormDialogProps) {
  const [type, setType] = useState<'SHIPPING' | 'BILLING'>('SHIPPING');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!address;

  // Load address data when editing
  useEffect(() => {
    if (address) {
      setType(address.type as 'SHIPPING' | 'BILLING');
      setFirstName(address.firstName);
      setLastName(address.lastName);
      setCompany(address.company || '');
      setAddress1(address.address1);
      setAddress2(address.address2 || '');
      setCity(address.city);
      setState(address.state);
      setPostalCode(address.postalCode);
      setCountry(address.country);
      setPhone(address.phone || '');
      setIsDefault(address.isDefault);
    } else {
      // Reset form
      setType('SHIPPING');
      setFirstName('');
      setLastName('');
      setCompany('');
      setAddress1('');
      setAddress2('');
      setCity('');
      setState('');
      setPostalCode('');
      setCountry('US');
      setPhone('');
      setIsDefault(false);
    }
    setError('');
  }, [address, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!lastName.trim()) {
      setError('Last name is required');
      return;
    }
    if (!address1.trim()) {
      setError('Street address is required');
      return;
    }
    if (!city.trim()) {
      setError('City is required');
      return;
    }
    if (!state) {
      setError('State is required');
      return;
    }
    if (!postalCode.trim()) {
      setError('Postal code is required');
      return;
    }

    setLoading(true);

    try {
      const input: AddressInput = {
        type,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        company: company.trim() || undefined,
        address1: address1.trim(),
        address2: address2.trim() || undefined,
        city: city.trim(),
        state,
        postalCode: postalCode.trim(),
        country,
        phone: phone.trim() || undefined,
        isDefault,
      };

      const result = isEditing
        ? await updateAddress(address.id, input)
        : await createAddress(input);

      if (result.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(result.error || 'Failed to save address');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Address form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your address details below'
              : 'Add a new shipping or billing address'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Address Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Address Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as 'SHIPPING' | 'BILLING')}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHIPPING">Shipping Address</SelectItem>
                  <SelectItem value="BILLING">Billing Address</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Company (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company name"
              />
            </div>

            {/* Address Line 1 */}
            <div className="space-y-2">
              <Label htmlFor="address1">
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address1"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="123 Main St"
                required
              />
            </div>

            {/* Address Line 2 (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="address2">Apartment, Suite, etc. (Optional)</Label>
              <Input
                id="address2"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Apt 4B"
              />
            </div>

            {/* City, State, Zip */}
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-3 space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  required
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 space-y-2">
                <Label htmlFor="postalCode">
                  Zip <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="94102"
                  required
                  maxLength={10}
                />
              </div>
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Set as Default */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="size-4 rounded border-gray-300"
              />
              <Label htmlFor="isDefault" className="cursor-pointer font-normal">
                Set as default {type.toLowerCase()} address
              </Label>
            </div>

            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Address' : 'Add Address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
