/**
 * ShopEcoProfileForm Component
 *
 * Form for sellers to manage their shop-level eco-profile.
 * Features tiered approach: Tier 1 (quick toggles) → Tier 2 (optional details).
 *
 * Features:
 * - Live completeness calculation
 * - Tiered disclosure (basic → detailed)
 * - Progress indicators
 * - Auto-save capability
 */

'use client';

import * as React from 'react';
import { Loader2, ChevronDown, ChevronUp, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EcoCompletenessBar } from '@/components/eco/eco-completeness-bar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { calculateShopCompleteness, calculateShopTier } from '@/lib/eco-calculations';

export interface ShopEcoProfileData {
  // Tier 1: Basic toggles
  plasticFreePackaging: boolean;
  recycledPackaging: boolean;
  biodegradablePackaging: boolean;
  organicMaterials: boolean;
  recycledMaterials: boolean;
  fairTradeSourcing: boolean;
  localSourcing: boolean;
  carbonNeutralShipping: boolean;
  renewableEnergy: boolean;
  carbonOffset: boolean;

  // Tier 2: Optional details
  annualCarbonEmissions?: number | null;
  carbonOffsetPercent?: number | null;
  renewableEnergyPercent?: number | null;
  waterConservation: boolean;
  fairWageCertified: boolean;
  takeBackProgram: boolean;
  repairService: boolean;
}

export interface ShopEcoProfileFormProps {
  /**
   * Current profile data
   */
  initialData?: Partial<ShopEcoProfileData>;
  /**
   * Commentary/additional details for each practice
   */
  commentary?: Record<string, string>;
  /**
   * Callback when form is submitted
   */
  onSubmit: (data: ShopEcoProfileData) => Promise<void>;
  /**
   * Callback when form data changes (for live updates)
   */
  onChange?: (data: ShopEcoProfileData) => void;
  /**
   * Callback when commentary changes
   */
  onCommentaryChange?: (field: string, value: string) => void;
  /**
   * Show save button (false for auto-save mode)
   */
  showSaveButton?: boolean;
  /**
   * Hide completeness bar (for application form)
   */
  hideCompleteness?: boolean;
  /**
   * Loading state
   */
  isLoading?: boolean;
}

const DEFAULT_PROFILE: ShopEcoProfileData = {
  plasticFreePackaging: false,
  recycledPackaging: false,
  biodegradablePackaging: false,
  organicMaterials: false,
  recycledMaterials: false,
  fairTradeSourcing: false,
  localSourcing: false,
  carbonNeutralShipping: false,
  renewableEnergy: false,
  carbonOffset: false,
  annualCarbonEmissions: null,
  carbonOffsetPercent: null,
  renewableEnergyPercent: null,
  waterConservation: false,
  fairWageCertified: false,
  takeBackProgram: false,
  repairService: false,
};

export function ShopEcoProfileForm({
  initialData,
  commentary = {},
  onSubmit,
  onChange,
  onCommentaryChange,
  showSaveButton = true,
  hideCompleteness = false,
  isLoading = false,
}: ShopEcoProfileFormProps) {
  const [formData, setFormData] = React.useState<ShopEcoProfileData>({
    ...DEFAULT_PROFILE,
    ...initialData,
  });
  const [isTier2Open, setIsTier2Open] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const completeness = calculateShopCompleteness(formData);
  const tier = calculateShopTier(completeness);

  // Store onChange callback in a ref to avoid re-render loops
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Track if component has mounted to avoid calling onChange on initial render
  const hasMounted = React.useRef(false);

  // Call onChange callback when formData changes (after render, skip initial mount)
  React.useEffect(() => {
    if (hasMounted.current) {
      onChangeRef.current?.(formData);
    } else {
      hasMounted.current = true;
    }
  }, [formData]);

  const handleToggle = (field: keyof ShopEcoProfileData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleNumberChange = (field: keyof ShopEcoProfileData, value: number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const tier1Count = [
    formData.plasticFreePackaging,
    formData.recycledPackaging,
    formData.biodegradablePackaging,
    formData.organicMaterials,
    formData.recycledMaterials,
    formData.fairTradeSourcing,
    formData.localSourcing,
    formData.carbonNeutralShipping,
    formData.renewableEnergy,
    formData.carbonOffset,
  ].filter(Boolean).length;

  // Use div wrapper when embedded in another form (showSaveButton=false)
  const Wrapper = showSaveButton ? 'form' : 'div';

  return (
    <Wrapper {...(showSaveButton ? { onSubmit: handleSubmit } : {})} className="space-y-6">
      {/* Completeness bar */}
      {!hideCompleteness && <EcoCompletenessBar percent={completeness} tier={tier} showTierBadge />}

      {/* Tier 1: Basic Practices */}
      <div className="bg-card space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Eco-Practices</h3>
            <p className="text-muted-foreground text-sm">
              Select all practices your business follows ({tier1Count}/10 selected)
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <CheckboxField
            label="Plastic-Free Packaging"
            checked={formData.plasticFreePackaging}
            onChange={() => handleToggle('plasticFreePackaging')}
            description="All packaging is free from plastic materials"
            fieldKey="plasticFreePackaging"
            commentaryValue={commentary.plasticFreePackaging}
            onCommentaryChange={
              onCommentaryChange
                ? (value) => onCommentaryChange('plasticFreePackaging', value)
                : undefined
            }
          />
          <CheckboxField
            label="Recycled Packaging"
            checked={formData.recycledPackaging}
            onChange={() => handleToggle('recycledPackaging')}
            description="Use recycled or recyclable packaging materials"
            fieldKey="recycledPackaging"
            commentaryValue={commentary.recycledPackaging}
            onCommentaryChange={
              onCommentaryChange
                ? (value) => onCommentaryChange('recycledPackaging', value)
                : undefined
            }
          />
          <CheckboxField
            label="Biodegradable Packaging"
            checked={formData.biodegradablePackaging}
            onChange={() => handleToggle('biodegradablePackaging')}
            description="Packaging materials are biodegradable or compostable"
            fieldKey="biodegradablePackaging"
            commentaryValue={commentary.biodegradablePackaging}
            onCommentaryChange={
              onCommentaryChange
                ? (value) => onCommentaryChange('biodegradablePackaging', value)
                : undefined
            }
          />
          <CheckboxField
            label="Organic Materials"
            checked={formData.organicMaterials}
            onChange={() => handleToggle('organicMaterials')}
            description="Products use certified organic materials"
            fieldKey="organicMaterials"
            commentaryValue={commentary.organicMaterials}
            onCommentaryChange={
              onCommentaryChange
                ? (value) => onCommentaryChange('organicMaterials', value)
                : undefined
            }
          />
          <CheckboxField
            label="Recycled Materials"
            checked={formData.recycledMaterials}
            onChange={() => handleToggle('recycledMaterials')}
            description="Products incorporate recycled materials"
            fieldKey="recycledMaterials"
            commentaryValue={commentary.recycledMaterials}
            onCommentaryChange={
              onCommentaryChange
                ? (value) => onCommentaryChange('recycledMaterials', value)
                : undefined
            }
          />
          <CheckboxField
            label="Fair Trade Sourcing"
            checked={formData.fairTradeSourcing}
            onChange={() => handleToggle('fairTradeSourcing')}
            description="Materials sourced from Fair Trade certified suppliers"
            fieldKey="fairTradeSourcing"
            commentaryValue={commentary.fairTradeSourcing}
            onCommentaryChange={
              onCommentaryChange
                ? (value) => onCommentaryChange('fairTradeSourcing', value)
                : undefined
            }
          />
          <CheckboxField
            label="Local Sourcing"
            checked={formData.localSourcing}
            onChange={() => handleToggle('localSourcing')}
            description="Source materials locally (within 100 miles)"
            fieldKey="localSourcing"
            commentaryValue={commentary.localSourcing}
            onCommentaryChange={
              onCommentaryChange ? (value) => onCommentaryChange('localSourcing', value) : undefined
            }
          />
          <CheckboxField
            label="Carbon-Neutral Shipping"
            checked={formData.carbonNeutralShipping}
            onChange={() => handleToggle('carbonNeutralShipping')}
            description="Offer carbon-neutral shipping options"
            fieldKey="carbonNeutralShipping"
            commentaryValue={commentary.carbonNeutralShipping}
            onCommentaryChange={
              onCommentaryChange
                ? (value) => onCommentaryChange('carbonNeutralShipping', value)
                : undefined
            }
          />
          <CheckboxField
            label="Renewable Energy"
            checked={formData.renewableEnergy}
            onChange={() => handleToggle('renewableEnergy')}
            description="Business powered by renewable energy"
            fieldKey="renewableEnergy"
            commentaryValue={commentary.renewableEnergy}
            onCommentaryChange={
              onCommentaryChange
                ? (value) => onCommentaryChange('renewableEnergy', value)
                : undefined
            }
          />
          <CheckboxField
            label="Carbon Offset"
            checked={formData.carbonOffset}
            onChange={() => handleToggle('carbonOffset')}
            description="Purchase carbon offsets for emissions"
            fieldKey="carbonOffset"
            commentaryValue={commentary.carbonOffset}
            onCommentaryChange={
              onCommentaryChange ? (value) => onCommentaryChange('carbonOffset', value) : undefined
            }
          />
        </div>
      </div>

      {/* Tier 2: Additional Practices (Collapsible) */}
      <Collapsible open={isTier2Open} onOpenChange={setIsTier2Open}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between" type="button">
            <span className="flex items-center gap-2">
              <Info className="size-4" />
              Additional Practices (Optional)
            </span>
            {isTier2Open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="bg-card space-y-6 rounded-lg border p-6">
            <h3 className="text-lg font-semibold">Advanced Sustainability Practices</h3>

            {/* Additional practices */}
            <div className="grid gap-3 sm:grid-cols-2">
              <CheckboxField
                label="Water Conservation"
                checked={formData.waterConservation}
                onChange={() => handleToggle('waterConservation')}
                description="Implement water-saving practices"
                fieldKey="waterConservation"
                commentaryValue={commentary.waterConservation}
                onCommentaryChange={
                  onCommentaryChange
                    ? (value) => onCommentaryChange('waterConservation', value)
                    : undefined
                }
              />
              <CheckboxField
                label="Fair Wage Certified"
                checked={formData.fairWageCertified}
                onChange={() => handleToggle('fairWageCertified')}
                description="Certified for fair labor practices"
                fieldKey="fairWageCertified"
                commentaryValue={commentary.fairWageCertified}
                onCommentaryChange={
                  onCommentaryChange
                    ? (value) => onCommentaryChange('fairWageCertified', value)
                    : undefined
                }
              />
              <CheckboxField
                label="Product Take-Back Program"
                checked={formData.takeBackProgram}
                onChange={() => handleToggle('takeBackProgram')}
                description="Accept products back for recycling/disposal"
                fieldKey="takeBackProgram"
                commentaryValue={commentary.takeBackProgram}
                onCommentaryChange={
                  onCommentaryChange
                    ? (value) => onCommentaryChange('takeBackProgram', value)
                    : undefined
                }
              />
              <CheckboxField
                label="Repair Service"
                checked={formData.repairService}
                onChange={() => handleToggle('repairService')}
                description="Offer product repair services"
                fieldKey="repairService"
                commentaryValue={commentary.repairService}
                onCommentaryChange={
                  onCommentaryChange
                    ? (value) => onCommentaryChange('repairService', value)
                    : undefined
                }
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Save button */}
      {showSaveButton && (
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving || isLoading} size="lg">
            {(isSaving || isLoading) && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Eco-Profile
          </Button>
        </div>
      )}
    </Wrapper>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  description?: string;
  fieldKey?: string;
  commentaryValue?: string;
  onCommentaryChange?: (value: string) => void;
}

function CheckboxField({
  label,
  checked,
  onChange,
  description,
  fieldKey,
  commentaryValue,
  onCommentaryChange,
}: CheckboxFieldProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-colors',
        checked
          ? 'border-eco-dark bg-eco-light/20'
          : 'hover:border-forest-light hover:bg-eco-light/10 border-neutral-200'
      )}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="text-forest-dark focus:ring-forest-dark mt-0.5 size-5 rounded border-gray-300"
        />
        <div className="flex-1">
          <span className="block text-sm font-medium text-neutral-800">{label}</span>
          {description && (
            <span className="mt-0.5 block text-xs text-neutral-600">{description}</span>
          )}
        </div>
      </label>

      {/* Optional commentary textarea */}
      {checked && onCommentaryChange && (
        <div className="mt-3 ml-8">
          <label htmlFor={`${fieldKey}-commentary`} className="mb-1 block text-xs text-neutral-600">
            Tell us more (optional)
          </label>
          <textarea
            id={`${fieldKey}-commentary`}
            value={commentaryValue || ''}
            onChange={(e) => onCommentaryChange(e.target.value)}
            placeholder="Add any additional details about this practice..."
            rows={2}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}
    </div>
  );
}
