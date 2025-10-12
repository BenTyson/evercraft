/**
 * ProductEcoProfileForm Component
 *
 * Form section for product-level eco-attributes.
 * Used within product create/edit forms.
 *
 * Features:
 * - Tiered approach (quick toggles → detailed info)
 * - Live completeness calculation
 * - Integrated with product form state
 */

'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { EcoCompletenessBar } from '@/components/eco/eco-completeness-bar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { calculateProductCompleteness } from '@/lib/eco-calculations';

export interface ProductEcoProfileData {
  // Materials
  isOrganic: boolean;
  isRecycled: boolean;
  isBiodegradable: boolean;
  isVegan: boolean;
  isFairTrade: boolean;
  organicPercent?: number | null;
  recycledPercent?: number | null;

  // Packaging
  plasticFreePackaging: boolean;
  recyclablePackaging: boolean;
  compostablePackaging: boolean;
  minimalPackaging: boolean;

  // Carbon & Origin
  carbonNeutralShipping: boolean;
  madeLocally: boolean;
  madeToOrder: boolean;
  renewableEnergyMade: boolean;
  carbonFootprintKg?: number | null;
  madeIn?: string | null;

  // End of Life
  isRecyclable: boolean;
  isCompostable: boolean;
  isRepairable: boolean;
  hasDisposalInfo: boolean;
  disposalInstructions?: string | null;
}

export interface ProductEcoProfileFormProps {
  /**
   * Current profile data
   */
  value: Partial<ProductEcoProfileData>;
  /**
   * Callback when data changes
   */
  onChange: (data: Partial<ProductEcoProfileData>) => void;
  /**
   * Show as embedded section (no border/padding)
   */
  embedded?: boolean;
}

const DEFAULT_PROFILE: ProductEcoProfileData = {
  isOrganic: false,
  isRecycled: false,
  isBiodegradable: false,
  isVegan: false,
  isFairTrade: false,
  organicPercent: null,
  recycledPercent: null,
  plasticFreePackaging: false,
  recyclablePackaging: false,
  compostablePackaging: false,
  minimalPackaging: false,
  carbonNeutralShipping: false,
  madeLocally: false,
  madeToOrder: false,
  renewableEnergyMade: false,
  carbonFootprintKg: null,
  madeIn: null,
  isRecyclable: false,
  isCompostable: false,
  isRepairable: false,
  hasDisposalInfo: false,
  disposalInstructions: null,
};

export function ProductEcoProfileForm({
  value,
  onChange,
  embedded = false,
}: ProductEcoProfileFormProps) {
  const [isTier2Open, setIsTier2Open] = React.useState(false);

  const formData = { ...DEFAULT_PROFILE, ...value };
  const completeness = calculateProductCompleteness(formData);

  const handleToggle = (field: keyof ProductEcoProfileData) => {
    onChange({
      ...formData,
      [field]: !formData[field],
    });
  };

  const handleChange = (field: keyof ProductEcoProfileData, val: string | number | null) => {
    onChange({
      ...formData,
      [field]: val,
    });
  };

  const containerClass = embedded ? 'space-y-4' : 'bg-card space-y-4 rounded-lg border p-6';

  const tier1Count = [
    formData.isOrganic,
    formData.isRecycled,
    formData.isBiodegradable,
    formData.isVegan,
    formData.isFairTrade,
    formData.plasticFreePackaging,
    formData.recyclablePackaging,
    formData.compostablePackaging,
    formData.minimalPackaging,
    formData.carbonNeutralShipping,
    formData.madeLocally,
    formData.madeToOrder,
    formData.renewableEnergyMade,
    formData.isRecyclable,
    formData.isCompostable,
    formData.isRepairable,
    formData.hasDisposalInfo,
  ].filter(Boolean).length;

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Product Eco-Profile</h3>
          <p className="text-muted-foreground text-sm">
            Select all attributes that apply to this product ({tier1Count}/17 selected)
          </p>
        </div>
      </div>

      {/* Completeness bar */}
      <EcoCompletenessBar percent={completeness} showLabel={false} />

      {/* Materials */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Materials</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleField
            label="Organic"
            checked={formData.isOrganic}
            onChange={() => handleToggle('isOrganic')}
          />
          <ToggleField
            label="Recycled"
            checked={formData.isRecycled}
            onChange={() => handleToggle('isRecycled')}
          />
          <ToggleField
            label="Biodegradable"
            checked={formData.isBiodegradable}
            onChange={() => handleToggle('isBiodegradable')}
          />
          <ToggleField
            label="Vegan"
            checked={formData.isVegan}
            onChange={() => handleToggle('isVegan')}
          />
          <ToggleField
            label="Fair Trade"
            checked={formData.isFairTrade}
            onChange={() => handleToggle('isFairTrade')}
          />
        </div>
      </div>

      {/* Packaging */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Packaging</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleField
            label="Plastic-Free"
            checked={formData.plasticFreePackaging}
            onChange={() => handleToggle('plasticFreePackaging')}
          />
          <ToggleField
            label="Recyclable"
            checked={formData.recyclablePackaging}
            onChange={() => handleToggle('recyclablePackaging')}
          />
          <ToggleField
            label="Compostable"
            checked={formData.compostablePackaging}
            onChange={() => handleToggle('compostablePackaging')}
          />
          <ToggleField
            label="Minimal Packaging"
            checked={formData.minimalPackaging}
            onChange={() => handleToggle('minimalPackaging')}
          />
        </div>
      </div>

      {/* Carbon & Origin */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Carbon & Origin</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleField
            label="Carbon-Neutral Shipping"
            checked={formData.carbonNeutralShipping}
            onChange={() => handleToggle('carbonNeutralShipping')}
          />
          <ToggleField
            label="Made Locally"
            checked={formData.madeLocally}
            onChange={() => handleToggle('madeLocally')}
          />
          <ToggleField
            label="Made-to-Order"
            checked={formData.madeToOrder}
            onChange={() => handleToggle('madeToOrder')}
          />
          <ToggleField
            label="Renewable Energy"
            checked={formData.renewableEnergyMade}
            onChange={() => handleToggle('renewableEnergyMade')}
          />
        </div>
      </div>

      {/* End of Life */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">End of Life</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleField
            label="Recyclable"
            checked={formData.isRecyclable}
            onChange={() => handleToggle('isRecyclable')}
          />
          <ToggleField
            label="Compostable"
            checked={formData.isCompostable}
            onChange={() => handleToggle('isCompostable')}
          />
          <ToggleField
            label="Repairable"
            checked={formData.isRepairable}
            onChange={() => handleToggle('isRepairable')}
          />
          <ToggleField
            label="Has Disposal Instructions"
            checked={formData.hasDisposalInfo}
            onChange={() => handleToggle('hasDisposalInfo')}
          />
        </div>
      </div>

      {/* Tier 2: Detailed Information */}
      <Collapsible open={isTier2Open} onOpenChange={setIsTier2Open}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between" type="button">
            <span className="flex items-center gap-2">
              <Info className="size-4" />
              Add Detailed Info (Optional - +30% Completeness)
            </span>
            {isTier2Open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          {/* Material percentages */}
          {formData.isOrganic && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Organic Percentage: {formData.organicPercent || 0}%
              </label>
              <Slider
                value={[formData.organicPercent || 0]}
                onValueChange={(val) => handleChange('organicPercent', val[0])}
                min={0}
                max={100}
                step={5}
              />
            </div>
          )}

          {formData.isRecycled && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Recycled Percentage: {formData.recycledPercent || 0}%
              </label>
              <Slider
                value={[formData.recycledPercent || 0]}
                onValueChange={(val) => handleChange('recycledPercent', val[0])}
                min={0}
                max={100}
                step={5}
              />
            </div>
          )}

          {/* Carbon footprint */}
          <div>
            <label className="mb-2 block text-sm font-medium">Carbon Footprint (kg CO₂)</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={formData.carbonFootprintKg || ''}
              onChange={(e) =>
                handleChange(
                  'carbonFootprintKg',
                  e.target.value ? parseFloat(e.target.value) : null
                )
              }
              placeholder="e.g., 2.5"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Approximate carbon footprint from production and shipping
            </p>
          </div>

          {/* Made in */}
          <div>
            <label className="mb-2 block text-sm font-medium">Made In</label>
            <Input
              type="text"
              value={formData.madeIn || ''}
              onChange={(e) => handleChange('madeIn', e.target.value || null)}
              placeholder="e.g., USA, India, etc."
            />
          </div>

          {/* Disposal instructions */}
          {formData.hasDisposalInfo && (
            <div>
              <label className="mb-2 block text-sm font-medium">Disposal Instructions</label>
              <Textarea
                value={formData.disposalInstructions || ''}
                onChange={(e) => handleChange('disposalInstructions', e.target.value || null)}
                placeholder="How should buyers dispose of this product at end of life?"
                rows={3}
              />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleField({ label, checked, onChange }: ToggleFieldProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-colors',
        checked ? 'border-eco-dark bg-eco-light/20 hover:bg-eco-light/30' : 'hover:bg-accent'
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="text-forest-dark focus:ring-forest-dark size-4 rounded border-gray-300"
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}
