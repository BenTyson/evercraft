'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPromotion, updatePromotion } from '@/actions/seller-promotions';
import { useRouter } from 'next/navigation';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    code: promotion?.code || '',
    description: promotion?.description || '',
    discountType: promotion?.discountType || 'PERCENTAGE',
    discountValue: promotion?.discountValue || 10,
    minimumPurchase: promotion?.minimumPurchase || '',
    maxUses: promotion?.maxUses || '',
    startDate: promotion?.startDate
      ? new Date(promotion.startDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    endDate: promotion?.endDate
      ? new Date(promotion.endDate).toISOString().slice(0, 16)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

    setLoading(false);

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.error || 'An error occurred');
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {promotion ? 'Edit Promotion' : 'Create Promotion'}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100" disabled={loading}>
            <X className="size-6 text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Promotion Code */}
          <div>
            <Label htmlFor="code">
              Promotion Code {!promotion && '(Optional - auto-generated if left blank)'}
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., SAVE20"
              maxLength={20}
              disabled={!!promotion} // Can't change code for existing promos
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Summer Sale - 20% off all products"
              required
              maxLength={200}
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discountType">Discount Type *</Label>
              <select
                id="discountType"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="discountValue">Discount Value *</Label>
              <Input
                id="discountValue"
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '5.00'}
                required
                min={formData.discountType === 'PERCENTAGE' ? 1 : 0.01}
                max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
                step={formData.discountType === 'PERCENTAGE' ? 1 : 0.01}
                className="mt-1"
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minimumPurchase">Minimum Purchase (Optional)</Label>
              <Input
                id="minimumPurchase"
                type="number"
                value={formData.minimumPurchase}
                onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value })}
                placeholder="e.g., 50.00"
                min={0}
                step={0.01}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="maxUses">Max Uses (Optional)</Label>
              <Input
                id="maxUses"
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                placeholder="e.g., 100"
                min={1}
                step={1}
                className="mt-1"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                className="mt-1"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : promotion ? 'Update Promotion' : 'Create Promotion'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
