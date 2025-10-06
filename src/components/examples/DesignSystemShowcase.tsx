'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Leaf } from 'lucide-react';
import { EcoBadge } from '@/components/eco/eco-badge';
import { SustainabilityScore } from '@/components/eco/sustainability-score';
import { ProductCard } from '@/components/eco/product-card';
import { ImpactWidget } from '@/components/eco/impact-widget';

/**
 * Design System Showcase Component
 * Demonstrates Evercraft's eco-focused design system in action
 */
export function DesignSystemShowcase() {
  const [favorited, setFavorited] = useState(false);
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <h1 className="text-foreground text-4xl font-bold">Evercraft Design System</h1>
          <p className="text-muted-foreground text-lg">
            A minimalist, eco-focused design system with dark forest green accents
          </p>
        </header>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="text-foreground text-2xl font-semibold">Color Palette</h2>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">
              Primary Colors (Forest Green)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <ColorSwatch name="Forest Dark" color="bg-forest-dark" hex="#1B4332" />
              <ColorSwatch name="Forest" color="bg-forest" hex="#2D6A4F" />
              <ColorSwatch name="Forest Light" color="bg-forest-light" hex="#40916C" />
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">Eco/Success Colors</h3>
            <div className="grid grid-cols-3 gap-4">
              <ColorSwatch name="Eco Dark" color="bg-eco-dark" hex="#52B788" />
              <ColorSwatch name="Eco" color="bg-eco" hex="#95D5B2" />
              <ColorSwatch name="Eco Light" color="bg-eco-light" hex="#D8F3DC" />
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">Neutrals</h3>
            <div className="grid grid-cols-4 gap-4">
              <ColorSwatch name="Neutral 50" color="bg-neutral-50" hex="#FAFAF8" />
              <ColorSwatch name="Neutral 200" color="bg-neutral-200" hex="#E9ECEF" />
              <ColorSwatch name="Neutral 600" color="bg-neutral-600" hex="#6C757D" />
              <ColorSwatch name="Neutral 800" color="bg-neutral-800" hex="#212529" />
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-foreground text-2xl font-semibold">Typography</h2>
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">Heading 1</p>
              <h1 className="text-4xl font-bold">The quick brown fox</h1>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Heading 2</p>
              <h2 className="text-3xl font-semibold">The quick brown fox</h2>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Heading 3</p>
              <h3 className="text-2xl font-semibold">The quick brown fox</h3>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Body</p>
              <p className="text-foreground text-base">
                Evercraft is building an alternative to mass e-commerce platforms, exclusively for
                eco-conscious products and sustainable businesses.
              </p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="text-foreground text-2xl font-semibold">Buttons</h2>

          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-3 text-sm">Primary Actions</p>
              <div className="flex flex-wrap gap-4">
                <Button>Shop Sustainable</Button>
                <Button size="lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button>
                  <Leaf className="mr-2 h-4 w-4" />
                  Eco Products
                </Button>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-3 text-sm">Secondary Actions</p>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary">Learn More</Button>
                <Button variant="outline">
                  <Heart className="mr-2 h-4 w-4" />
                  Save for Later
                </Button>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-3 text-sm">Ghost/Subtle</p>
              <div className="flex flex-wrap gap-4">
                <Button variant="ghost">View Details</Button>
                <Button variant="link">Read Mission →</Button>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-3 text-sm">States</p>
              <div className="flex flex-wrap gap-4">
                <Button disabled>Out of Stock</Button>
                <Button variant="destructive">Remove</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-6">
          <h2 className="text-foreground text-2xl font-semibold">Cards</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Product Card Example */}
            <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-lg">
              <div className="aspect-square bg-neutral-100"></div>
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="bg-eco-light text-forest-dark rounded-full px-2 py-1 text-xs font-medium">
                    Eco Gold
                  </span>
                  <Heart className="text-muted-foreground h-5 w-5" />
                </div>
                <h3 className="mb-1 font-semibold">Organic Cotton Tote</h3>
                <p className="text-muted-foreground text-sm">EcoMaker Studio</p>
                <p className="mt-2 font-semibold">$24.99</p>
              </div>
            </div>

            {/* Impact Card Example */}
            <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
              <Leaf className="text-eco-dark mb-4 h-10 w-10" />
              <h3 className="mb-2 text-lg font-semibold">Your Impact</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                You&apos;ve supported 5 eco-businesses and donated to 3 nonprofits
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Impact Dashboard
              </Button>
            </div>

            {/* Seller Card Example */}
            <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-neutral-200"></div>
                <div>
                  <h3 className="font-semibold">EcoMaker Studio</h3>
                  <p className="text-muted-foreground text-sm">Verified Seller</p>
                </div>
              </div>
              <p className="mb-4 text-sm">
                Handcrafted sustainable goods made with organic materials.
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                Visit Shop
              </Button>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-6">
          <h2 className="text-foreground text-2xl font-semibold">Badges & Labels</h2>

          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-3 text-sm">Eco Scores</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-eco-dark text-white">Gold (90-100)</Badge>
                <Badge className="bg-eco text-forest-dark">Silver (70-89)</Badge>
                <Badge className="bg-eco-light text-forest-dark">Bronze (50-69)</Badge>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-3 text-sm">Status Badges</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-eco-light text-forest-dark">In Stock</Badge>
                <Badge className="bg-warning-light text-warning-foreground">Low Stock</Badge>
                <Badge className="bg-neutral-200 text-neutral-600">Sold Out</Badge>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-3 text-sm">Certifications</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Fair Trade</Badge>
                <Badge variant="outline">Organic</Badge>
                <Badge variant="outline">B-Corp</Badge>
                <Badge variant="outline">Carbon Neutral</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Eco-Specific Components */}
        <section className="space-y-6">
          <h2 className="text-foreground text-2xl font-semibold">Eco Components</h2>

          {/* EcoBadges */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">Eco Badges</h3>
            <div className="flex flex-wrap gap-3">
              <EcoBadge variant="plastic-free" />
              <EcoBadge variant="carbon-neutral" />
              <EcoBadge variant="fair-trade" />
              <EcoBadge variant="b-corp" />
              <EcoBadge variant="vegan" />
              <EcoBadge variant="organic" />
              <EcoBadge variant="recycled" />
              <EcoBadge variant="zero-waste" />
            </div>
          </div>

          {/* Sustainability Scores */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">Sustainability Score</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground mb-3 text-xs">High Score (85)</p>
                <SustainabilityScore score={85} />
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground mb-3 text-xs">Medium Score (62)</p>
                <SustainabilityScore score={62} />
              </div>
            </div>
            <div className="mt-4 rounded-lg border p-4">
              <p className="text-muted-foreground mb-3 text-xs">With Breakdown</p>
              <SustainabilityScore
                score={87}
                showBreakdown
                breakdown={{
                  materials: 92,
                  packaging: 85,
                  carbon: 78,
                  certifications: 95,
                }}
              />
            </div>
          </div>
        </section>

        {/* Product Cards */}
        <section className="space-y-6">
          <h2 className="text-foreground text-2xl font-semibold">Product Cards</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ProductCard
              product={{
                id: '1',
                title: 'Organic Cotton Tote Bag - Reusable Shopping Bag',
                price: 24.99,
                compareAtPrice: 34.99,
                image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
                imageAlt: 'Organic cotton tote bag',
              }}
              seller={{
                name: 'EcoMaker Studio',
                slug: 'ecomaker-studio',
              }}
              nonprofit={{
                name: 'Ocean Conservancy',
                shortName: 'Ocean Conservancy',
              }}
              ecoBadge="plastic-free"
              sustainabilityScore={87}
              rating={4.8}
              reviewCount={124}
              isFavorited={favorited}
              onFavoriteClick={() => setFavorited(!favorited)}
              onQuickAddClick={() => alert('Added to cart!')}
              onProductClick={() => alert('View product')}
            />

            <ProductCard
              product={{
                id: '2',
                title: 'Bamboo Cutlery Set - Zero Waste Travel Utensils',
                price: 18.5,
                image: 'https://images.unsplash.com/photo-1600882291950-70aff82ff089?w=800&q=80',
                imageAlt: 'Bamboo cutlery set',
              }}
              seller={{
                name: 'Green Living Co',
                slug: 'green-living-co',
              }}
              nonprofit={{
                name: 'Rainforest Alliance',
                shortName: 'Rainforest',
              }}
              ecoBadge="zero-waste"
              sustainabilityScore={92}
              rating={4.9}
              reviewCount={89}
              onQuickAddClick={() => alert('Added to cart!')}
            />

            <ProductCard
              product={{
                id: '3',
                title: 'Fair Trade Organic Coffee Beans - 12oz',
                price: 15.99,
                image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
                imageAlt: 'Organic coffee beans',
              }}
              seller={{
                name: 'Ethical Grounds',
                slug: 'ethical-grounds',
              }}
              nonprofit={{
                name: 'Fair Trade Federation',
                shortName: 'Fair Trade Fed',
              }}
              ecoBadge="fair-trade"
              sustainabilityScore={78}
              rating={4.7}
              reviewCount={256}
              onQuickAddClick={() => alert('Added to cart!')}
            />
          </div>
        </section>

        {/* Impact Widget */}
        <section className="space-y-6">
          <h2 className="text-foreground text-2xl font-semibold">Impact Widget</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <ImpactWidget
              totalDonation={12.5}
              nonprofits={[
                { name: 'Ocean Conservancy', amount: 5.0 },
                { name: 'Rainforest Alliance', amount: 4.5 },
                { name: 'Fair Trade Federation', amount: 3.0 },
              ]}
              metrics={[
                { type: 'co2', label: 'CO₂ Offset', value: '5.2 lbs' },
                { type: 'trees', label: 'Trees Planted', value: '3' },
                { type: 'water', label: 'Water Saved', value: '12 gal' },
                { type: 'plastic', label: 'Plastic Avoided', value: '2.1 lbs' },
              ]}
            />

            <ImpactWidget
              totalDonation={8.75}
              nonprofits={[{ name: 'The Nature Conservancy', amount: 8.75 }]}
              metrics={[
                { type: 'co2', label: 'CO₂ Offset', value: '3.1 lbs' },
                { type: 'trees', label: 'Trees Planted', value: '2' },
              ]}
              variant="highlight"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// Helper Components

function ColorSwatch({ name, color, hex }: { name: string; color: string; hex: string }) {
  return (
    <div className="space-y-2">
      <div className={`h-20 w-full rounded-lg ${color} shadow-sm`}></div>
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-muted-foreground text-xs">{hex}</p>
      </div>
    </div>
  );
}

function Badge({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
}) {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variantClasses = variant === 'outline' ? 'border border-border' : '';

  return <span className={`${baseClasses} ${variantClasses} ${className}`}>{children}</span>;
}
