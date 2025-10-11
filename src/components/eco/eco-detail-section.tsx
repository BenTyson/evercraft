/**
 * EcoDetailSection Component
 *
 * Comprehensive eco-impact display for Product Detail Pages.
 * Replaces the old SustainabilityScore section with clearer, badge-based presentation.
 *
 * Features:
 * - At-a-glance summary with completeness bar
 * - Active attribute badges (with verification checkmarks)
 * - Expandable detailed breakdown
 * - Shop eco-profile info
 */

'use client';

import * as React from 'react';
import { Leaf, Package, Zap, Recycle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import { EcoCompletenessBar } from './eco-completeness-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface ProductEcoProfile {
  completenessPercent: number;
  // Materials
  isOrganic?: boolean;
  isRecycled?: boolean;
  isBiodegradable?: boolean;
  isVegan?: boolean;
  isFairTrade?: boolean;
  organicPercent?: number | null;
  recycledPercent?: number | null;
  // Packaging
  plasticFreePackaging?: boolean;
  recyclablePackaging?: boolean;
  compostablePackaging?: boolean;
  minimalPackaging?: boolean;
  // Carbon
  carbonNeutralShipping?: boolean;
  madeLocally?: boolean;
  madeToOrder?: boolean;
  renewableEnergyMade?: boolean;
  carbonFootprintKg?: number | null;
  madeIn?: string | null;
  // End of Life
  isRecyclable?: boolean;
  isCompostable?: boolean;
  isRepairable?: boolean;
  disposalInstructions?: string | null;
}

export interface ShopEcoProfile {
  completenessPercent: number;
  tier: string;
  plasticFreePackaging?: boolean;
  organicMaterials?: boolean;
  carbonNeutralShipping?: boolean;
  renewableEnergy?: boolean;
}

export interface Certification {
  id: string;
  name: string;
  type: string;
  verified?: boolean;
  verifiedAt?: Date | null;
}

export interface EcoDetailSectionProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /**
   * Product eco-profile
   */
  productProfile: ProductEcoProfile;
  /**
   * Shop eco-profile (shows shop practices)
   */
  shopProfile?: ShopEcoProfile;
  /**
   * Product certifications
   */
  certifications?: Certification[];
  /**
   * Shop name (for display)
   */
  shopName?: string;
}

function EcoDetailSection({
  productProfile,
  shopProfile,
  certifications = [],
  shopName,
  className,
  ...props
}: EcoDetailSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const hasAnyData =
    productProfile.completenessPercent > 0 ||
    (shopProfile && shopProfile.completenessPercent > 0) ||
    certifications.length > 0;

  if (!hasAnyData) {
    return null;
  }

  const verifiedCerts = certifications.filter((c) => c.verified);

  return (
    <div className={cn('mt-12', className)} {...props}>
      <div className="bg-card space-y-6 rounded-lg border p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Sustainability At A Glance</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Eco-credentials for this product{shopName && ` from ${shopName}`}
            </p>
          </div>
          {verifiedCerts.length > 0 && (
            <Badge variant="secondary" className="bg-forest-light gap-1 text-white">
              <CheckCircle2 className="size-3" />
              {verifiedCerts.length} Verified Cert{verifiedCerts.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Completeness bars */}
        <div className="grid gap-4 md:grid-cols-2">
          <EcoCompletenessBar
            percent={productProfile.completenessPercent}
            label="Product Eco-Info"
          />
          {shopProfile && (
            <EcoCompletenessBar
              percent={shopProfile.completenessPercent}
              tier={shopProfile.tier as 'starter' | 'verified' | 'certified'}
              label="Shop Eco-Info"
              showTierBadge
            />
          )}
        </div>

        {/* Quick summary of active attributes */}
        <div className="border-border grid gap-4 border-t pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Materials */}
          <AttributeGroup
            icon={Leaf}
            title="Materials"
            attributes={[
              productProfile.isOrganic ? 'Organic' : false,
              productProfile.isRecycled ? 'Recycled' : false,
              productProfile.isBiodegradable ? 'Biodegradable' : false,
              productProfile.isVegan ? 'Vegan' : false,
              productProfile.isFairTrade ? 'Fair Trade' : false,
            ]}
          />

          {/* Packaging */}
          <AttributeGroup
            icon={Package}
            title="Packaging"
            attributes={[
              productProfile.plasticFreePackaging ? 'Plastic-Free' : false,
              productProfile.recyclablePackaging ? 'Recyclable' : false,
              productProfile.compostablePackaging ? 'Compostable' : false,
              productProfile.minimalPackaging ? 'Minimal' : false,
            ]}
          />

          {/* Carbon */}
          <AttributeGroup
            icon={Zap}
            title="Carbon"
            attributes={[
              productProfile.carbonNeutralShipping ? 'Neutral Shipping' : false,
              productProfile.madeLocally ? 'Made Locally' : false,
              productProfile.madeToOrder ? 'Made-to-Order' : false,
              productProfile.renewableEnergyMade ? 'Renewable Energy' : false,
            ]}
          />

          {/* End of Life */}
          <AttributeGroup
            icon={Recycle}
            title="End of Life"
            attributes={[
              productProfile.isRecyclable ? 'Recyclable' : false,
              productProfile.isCompostable ? 'Compostable' : false,
              productProfile.isRepairable ? 'Repairable' : false,
            ]}
          />
        </div>

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="border-border border-t pt-6">
            <h3 className="mb-3 text-sm font-semibold">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <Badge
                  key={cert.id}
                  variant={cert.verified ? 'default' : 'outline'}
                  className={cn('gap-1', cert.verified && 'bg-forest text-white')}
                >
                  {cert.verified && <CheckCircle2 className="size-3" />}
                  {cert.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Expandable details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>View Detailed Breakdown</span>
              {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="space-y-6">
              {/* Materials details */}
              {(productProfile.isOrganic ||
                productProfile.isRecycled ||
                productProfile.organicPercent ||
                productProfile.recycledPercent) && (
                <DetailGroup title="Materials">
                  {productProfile.isOrganic && (
                    <DetailItem
                      label="Organic"
                      value={
                        productProfile.organicPercent
                          ? `${productProfile.organicPercent}% organic materials`
                          : 'Certified organic materials used'
                      }
                    />
                  )}
                  {productProfile.isRecycled && (
                    <DetailItem
                      label="Recycled"
                      value={
                        productProfile.recycledPercent
                          ? `${productProfile.recycledPercent}% recycled content`
                          : 'Contains recycled materials'
                      }
                    />
                  )}
                  {productProfile.isBiodegradable && (
                    <DetailItem label="Biodegradable" value="Materials will naturally decompose" />
                  )}
                  {productProfile.isVegan && (
                    <DetailItem label="Vegan" value="No animal products or by-products" />
                  )}
                  {productProfile.isFairTrade && (
                    <DetailItem label="Fair Trade" value="Sourced from Fair Trade suppliers" />
                  )}
                </DetailGroup>
              )}

              {/* Packaging details */}
              {(productProfile.plasticFreePackaging ||
                productProfile.recyclablePackaging ||
                productProfile.compostablePackaging ||
                productProfile.minimalPackaging) && (
                <DetailGroup title="Packaging">
                  {productProfile.plasticFreePackaging && (
                    <DetailItem label="Plastic-Free" value="Zero plastic in packaging" />
                  )}
                  {productProfile.recyclablePackaging && (
                    <DetailItem label="Recyclable" value="All packaging can be recycled" />
                  )}
                  {productProfile.compostablePackaging && (
                    <DetailItem label="Compostable" value="Packaging is compostable" />
                  )}
                  {productProfile.minimalPackaging && (
                    <DetailItem label="Minimal" value="Reduced packaging waste" />
                  )}
                </DetailGroup>
              )}

              {/* Carbon details */}
              {(productProfile.carbonNeutralShipping ||
                productProfile.carbonFootprintKg ||
                productProfile.madeIn) && (
                <DetailGroup title="Carbon Impact">
                  {productProfile.carbonFootprintKg && (
                    <DetailItem
                      label="Carbon Footprint"
                      value={`${productProfile.carbonFootprintKg} kg CO₂`}
                    />
                  )}
                  {productProfile.carbonNeutralShipping && (
                    <DetailItem label="Carbon-Neutral Shipping" value="Available at checkout" />
                  )}
                  {productProfile.madeLocally && (
                    <DetailItem label="Made Locally" value="Reduces transportation emissions" />
                  )}
                  {productProfile.madeIn && (
                    <DetailItem label="Made In" value={productProfile.madeIn} />
                  )}
                </DetailGroup>
              )}

              {/* End of life details */}
              {productProfile.disposalInstructions && (
                <DetailGroup title="End of Life">
                  <DetailItem
                    label="Disposal Instructions"
                    value={productProfile.disposalInstructions}
                  />
                </DetailGroup>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

interface AttributeGroupProps {
  icon: React.ElementType;
  title: string;
  attributes: (string | false)[];
}

function AttributeGroup({ icon: Icon, title, attributes }: AttributeGroupProps) {
  const activeAttributes = attributes.filter(Boolean) as string[];

  if (activeAttributes.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="text-muted-foreground size-4" />
          <span className="text-muted-foreground">{title}</span>
        </div>
        <p className="text-muted-foreground text-xs">No info provided</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="text-eco-dark size-4" />
        <span>{title}</span>
      </div>
      <ul className="space-y-1">
        {activeAttributes.map((attr, index) => (
          <li key={index} className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="text-eco-dark size-3 shrink-0" />
            <span>{attr}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface DetailGroupProps {
  title: string;
  children: React.ReactNode;
}

function DetailGroup({ title, children }: DetailGroupProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="border-border space-y-2 border-l-2 pl-4">{children}</div>
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <span className="text-muted-foreground text-xs font-medium">{label}:</span>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}

export { EcoDetailSection };
