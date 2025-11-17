'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { FormField } from '@/components/forms/form-field';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { validateForm, hasErrors, ValidationSchema } from '@/lib/validation';
import { createAddress, updateAddress, type AddressInput } from '@/actions/addresses';

interface FormData {
  type: 'SHIPPING' | 'BILLING';
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const validationSchema: ValidationSchema<FormData> = {
  firstName: {
    required: 'First name is required',
  },
  lastName: {
    required: 'Last name is required',
  },
  address1: {
    required: 'Street address is required',
  },
  city: {
    required: 'City is required',
  },
  state: {
    required: 'State is required',
  },
  postalCode: {
    required: 'Postal code is required',
  },
};

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
  const isEditing = !!address;

  const { isSubmitting, error, handleSubmit } = useFormSubmission({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const [formData, setFormData] = useState<FormData>({
    type: 'SHIPPING',
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
    isDefault: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Load address data when editing
  useEffect(() => {
    if (address) {
      setFormData({
        type: address.type as 'SHIPPING' | 'BILLING',
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company || '',
        address1: address.address1,
        address2: address.address2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone || '',
        isDefault: address.isDefault,
      });
    } else {
      // Reset form
      setFormData({
        type: 'SHIPPING',
        firstName: '',
        lastName: '',
        company: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
        phone: '',
        isDefault: false,
      });
    }
    setFieldErrors({});
  }, [address, open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm(formData, validationSchema);
    setFieldErrors(errors);

    if (hasErrors(errors)) {
      return;
    }

    // Submit form
    await handleSubmit(async () => {
      const input: AddressInput = {
        type: formData.type,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        company: formData.company.trim() || undefined,
        address1: formData.address1.trim(),
        address2: formData.address2.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state,
        postalCode: formData.postalCode.trim(),
        country: formData.country,
        phone: formData.phone.trim() || undefined,
        isDefault: formData.isDefault,
      };

      const result = isEditing
        ? await updateAddress(address.id, input)
        : await createAddress(input);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save address');
      }
    });
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

        <form onSubmit={onSubmit}>
          <div className="space-y-4 py-4">
            {/* Address Type */}
            <FormField label="Address Type" name="type">
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as 'SHIPPING' | 'BILLING' })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHIPPING">Shipping Address</SelectItem>
                  <SelectItem value="BILLING">Billing Address</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" name="firstName" required error={fieldErrors.firstName}>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value });
                    setFieldErrors({ ...fieldErrors, firstName: undefined });
                  }}
                  placeholder="John"
                  aria-invalid={!!fieldErrors.firstName}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField label="Last Name" name="lastName" required error={fieldErrors.lastName}>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value });
                    setFieldErrors({ ...fieldErrors, lastName: undefined });
                  }}
                  placeholder="Doe"
                  aria-invalid={!!fieldErrors.lastName}
                  disabled={isSubmitting}
                />
              </FormField>
            </div>

            {/* Company (Optional) */}
            <FormField label="Company" name="company">
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name"
                disabled={isSubmitting}
              />
            </FormField>

            {/* Address Line 1 */}
            <FormField label="Street Address" name="address1" required error={fieldErrors.address1}>
              <Input
                id="address1"
                value={formData.address1}
                onChange={(e) => {
                  setFormData({ ...formData, address1: e.target.value });
                  setFieldErrors({ ...fieldErrors, address1: undefined });
                }}
                placeholder="123 Main St"
                aria-invalid={!!fieldErrors.address1}
                disabled={isSubmitting}
              />
            </FormField>

            {/* Address Line 2 (Optional) */}
            <FormField label="Apartment, Suite, etc." name="address2">
              <Input
                id="address2"
                value={formData.address2}
                onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                placeholder="Apt 4B"
                disabled={isSubmitting}
              />
            </FormField>

            {/* City, State, Zip */}
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-3">
                <FormField label="City" name="city" required error={fieldErrors.city}>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      setFieldErrors({ ...fieldErrors, city: undefined });
                    }}
                    placeholder="San Francisco"
                    aria-invalid={!!fieldErrors.city}
                    disabled={isSubmitting}
                  />
                </FormField>
              </div>
              <div className="col-span-2">
                <FormField label="State" name="state" required error={fieldErrors.state}>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => {
                      setFormData({ ...formData, state: value });
                      setFieldErrors({ ...fieldErrors, state: undefined });
                    }}
                    disabled={isSubmitting}
                  >
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
                </FormField>
              </div>
              <div className="col-span-1">
                <FormField label="Zip" name="postalCode" required error={fieldErrors.postalCode}>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => {
                      setFormData({ ...formData, postalCode: e.target.value });
                      setFieldErrors({ ...fieldErrors, postalCode: undefined });
                    }}
                    placeholder="94102"
                    aria-invalid={!!fieldErrors.postalCode}
                    disabled={isSubmitting}
                    maxLength={10}
                  />
                </FormField>
              </div>
            </div>

            {/* Phone (Optional) */}
            <FormField label="Phone" name="phone">
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                disabled={isSubmitting}
              />
            </FormField>

            {/* Set as Default */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="size-4 rounded border-gray-300"
                disabled={isSubmitting}
              />
              <label htmlFor="isDefault" className="cursor-pointer text-sm font-normal">
                Set as default {formData.type.toLowerCase()} address
              </label>
            </div>

            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Address' : 'Add Address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
