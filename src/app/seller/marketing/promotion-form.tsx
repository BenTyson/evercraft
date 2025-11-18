'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/form-field';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { validateForm, hasErrors, ValidationSchema } from '@/lib/validation';
import { createPromotion, updatePromotion } from '@/actions/seller-promotions';
import { useRouter } from 'next/navigation';

interface FormData {
  code: string;
  description: string;
  discountType: string;
  discountValue: string;
  minimumPurchase: string;
  maxUses: string;
  startDate: string;
  endDate: string;
}

const validationSchema: ValidationSchema<FormData> = {
  description: {
    required: 'Description is required',
    maxLength: { value: 200, message: 'Description must not exceed 200 characters' },
  },
  discountValue: {
    required: 'Discount value is required',
    validate: (value) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) return 'Discount value must be greater than 0';
      return true;
    },
  },
  startDate: {
    required: 'Start date is required',
  },
  endDate: {
    required: 'End date is required',
  },
};

interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minimumPurchase: number | null;
  maxUses: number | null;
  startDate: Date;
  endDate: Date;
}

interface PromotionFormProps {
  promotion?: Promotion;
  onClose: () => void;
}

export default function PromotionForm({ promotion, onClose }: PromotionFormProps) {
  const router = useRouter();

  const { isSubmitting, error, handleSubmit } = useFormSubmission({
    onSuccess: () => {
      router.refresh();
      onClose();
    },
  });

  const [formData, setFormData] = useState<FormData>({
    code: promotion?.code || '',
    description: promotion?.description || '',
    discountType: promotion?.discountType || 'PERCENTAGE',
    discountValue: promotion?.discountValue?.toString() || '10',
    minimumPurchase: promotion?.minimumPurchase?.toString() || '',
    maxUses: promotion?.maxUses?.toString() || '',
    startDate: promotion?.startDate
      ? new Date(promotion.startDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    endDate: promotion?.endDate
      ? new Date(promotion.endDate).toISOString().slice(0, 16)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm(formData, validationSchema);

    // Add cross-field validation for dates
    if (formData.endDate && formData.startDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        errors.endDate = 'End date must be after start date';
      }
    }

    setFieldErrors(errors);

    if (hasErrors(errors)) {
      return;
    }

    // Submit form
    await handleSubmit(async () => {
      const data = {
        code: formData.code.trim() || undefined,
        description: formData.description.trim(),
        discountType: formData.discountType as 'PERCENTAGE' | 'FIXED',
        discountValue: Number(formData.discountValue),
        minimumPurchase: formData.minimumPurchase ? Number(formData.minimumPurchase) : undefined,
        maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      };

      let result;
      if (promotion) {
        result = await updatePromotion(promotion.id, data);
      } else {
        result = await createPromotion(data);
      }

      if (!result.success) {
        throw new Error(result.error || 'An error occurred');
      }
    });
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {promotion ? 'Edit Promotion' : 'Create Promotion'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-gray-100"
            disabled={isSubmitting}
          >
            <X className="size-6 text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Promotion Code */}
          <FormField
            label={`Promotion Code ${!promotion ? '(Optional - auto-generated if left blank)' : ''}`}
            name="code"
          >
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., SAVE20"
              maxLength={20}
              disabled={!!promotion || isSubmitting} // Can't change code for existing promos
            />
          </FormField>

          {/* Description */}
          <FormField
            label="Description"
            name="description"
            required
            error={fieldErrors.description}
          >
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                setFieldErrors({ ...fieldErrors, description: undefined });
              }}
              placeholder="e.g., Summer Sale - 20% off all products"
              maxLength={200}
              rows={3}
              disabled={isSubmitting}
              aria-invalid={!!fieldErrors.description}
            />
          </FormField>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Discount Type" name="discountType" required>
              <select
                id="discountType"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                disabled={isSubmitting}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </FormField>

            <FormField
              label="Discount Value"
              name="discountValue"
              required
              error={fieldErrors.discountValue}
            >
              <Input
                id="discountValue"
                type="number"
                value={formData.discountValue}
                onChange={(e) => {
                  setFormData({ ...formData, discountValue: e.target.value });
                  setFieldErrors({ ...fieldErrors, discountValue: undefined });
                }}
                placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '5.00'}
                min={formData.discountType === 'PERCENTAGE' ? 1 : 0.01}
                max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
                step={formData.discountType === 'PERCENTAGE' ? 1 : 0.01}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.discountValue}
              />
            </FormField>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Minimum Purchase" name="minimumPurchase">
              <Input
                id="minimumPurchase"
                type="number"
                value={formData.minimumPurchase}
                onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value })}
                placeholder="e.g., 50.00"
                min={0}
                step={0.01}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Max Uses" name="maxUses">
              <Input
                id="maxUses"
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                placeholder="e.g., 100"
                min={1}
                step={1}
                disabled={isSubmitting}
              />
            </FormField>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" name="startDate" required error={fieldErrors.startDate}>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value });
                  setFieldErrors({ ...fieldErrors, startDate: undefined });
                }}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.startDate}
              />
            </FormField>

            <FormField label="End Date" name="endDate" required error={fieldErrors.endDate}>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => {
                  setFormData({ ...formData, endDate: e.target.value });
                  setFieldErrors({ ...fieldErrors, endDate: undefined });
                }}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.endDate}
              />
            </FormField>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : promotion ? 'Update Promotion' : 'Create Promotion'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
