/**
 * Product Detail Page (PDP)
 *
 * Comprehensive product view with images, details, sustainability info, and reviews.
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  ShoppingCart,
  Star,
  Leaf,
  Package,
  Truck,
  Shield,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/site-header';
import { EcoBadge } from '@/components/eco/eco-badge';
import { SustainabilityScore } from '@/components/eco/sustainability-score';
import { ProductCard } from '@/components/eco/product-card';
import { cn } from '@/lib/utils';

// Mock product data - will be replaced with actual API/database data
const MOCK_PRODUCT = {
  id: '1',
  title: 'Organic Cotton Tote Bag - Reusable Shopping Bag',
  price: 24.99,
  compareAtPrice: 34.99,
  images: [
    {
      url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=1200&q=80',
      alt: 'Organic cotton tote bag - front view',
    },
    {
      url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&q=80',
      alt: 'Organic cotton tote bag - side view',
    },
    {
      url: 'https://images.unsplash.com/photo-1580713284369-5b93c2cf5e2a?w=1200&q=80',
      alt: 'Organic cotton tote bag - detail',
    },
  ],
  description:
    "This durable, reusable tote bag is made from 100% organic cotton, grown without harmful pesticides or synthetic fertilizers. Perfect for grocery shopping, farmers markets, or everyday errands. The spacious design holds up to 20 lbs, and the reinforced handles ensure long-lasting use. By choosing this tote, you're reducing single-use plastic waste and supporting sustainable agriculture.",
  seller: {
    name: 'EcoMaker Studio',
    slug: 'ecomaker-studio',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80',
    rating: 4.8,
    reviewCount: 342,
    joinedDate: 'Member since 2022',
  },
  nonprofit: {
    name: 'Ocean Conservancy',
    shortName: 'Ocean Conservancy',
    logo: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&q=80',
    donationPercentage: 5,
  },
  certifications: ['organic', 'plastic-free'] as const,
  ecoAttributes: {
    material: '100% Organic Cotton',
    packaging: 'Compostable packaging made from recycled materials',
    carbonFootprint: 'Carbon offset through tree planting partnerships',
    madeIn: 'USA',
  },
  sustainabilityScore: {
    total: 87,
    materials: 92,
    packaging: 85,
    carbon: 80,
    certifications: 90,
  },
  rating: 4.8,
  reviewCount: 124,
  stock: 47,
  sku: 'ECO-TOTE-001',
};

const MOCK_REVIEWS = [
  {
    id: '1',
    author: 'Sarah M.',
    rating: 5,
    date: '2 weeks ago',
    verified: true,
    text: "Love this tote! It's sturdy, spacious, and I feel good knowing it's made from organic cotton. Perfect for my weekly grocery runs.",
  },
  {
    id: '2',
    author: 'James P.',
    rating: 4,
    date: '1 month ago',
    verified: true,
    text: 'Great quality bag. The handles are comfortable and it holds a lot. Only wish it came in more colors!',
  },
  {
    id: '3',
    author: 'Emily R.',
    rating: 5,
    date: '2 months ago',
    verified: true,
    text: 'Excellent product! I bought 3 of these to replace all my plastic bags. They wash well and look great.',
  },
];

const RELATED_PRODUCTS = [
  {
    id: '2',
    title: 'Bamboo Cutlery Set',
    price: 18.5,
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80',
    imageAlt: 'Bamboo cutlery set',
    seller: { name: 'Green Living Co', slug: 'green-living-co' },
    nonprofit: { name: 'Rainforest Alliance', shortName: 'Rainforest' },
    certifications: ['zero-waste', 'plastic-free', 'vegan'] as const,
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: '4',
    title: 'Reusable Beeswax Wraps',
    price: 22.0,
    image: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80',
    imageAlt: 'Beeswax food wraps',
    seller: { name: 'EcoMaker Studio', slug: 'ecomaker-studio' },
    nonprofit: { name: 'The Nature Conservancy', shortName: 'Nature Conservancy' },
    certifications: ['zero-waste', 'organic'] as const,
    rating: 4.9,
    reviewCount: 178,
  },
  {
    id: '5',
    title: 'Stainless Steel Water Bottle',
    price: 29.99,
    compareAtPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
    imageAlt: 'Stainless steel water bottle',
    seller: { name: 'Green Living Co', slug: 'green-living-co' },
    nonprofit: { name: 'Ocean Conservancy', shortName: 'Ocean Conservancy' },
    certifications: ['plastic-free', 'carbon-neutral'] as const,
    rating: 4.6,
    reviewCount: 312,
  },
];

export default function ProductDetailPage() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [relatedFavorites, setRelatedFavorites] = useState<Record<string, boolean>>({});

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(MOCK_PRODUCT.price);

  const formattedComparePrice = MOCK_PRODUCT.compareAtPrice
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(MOCK_PRODUCT.compareAtPrice)
    : null;

  const discountPercentage = MOCK_PRODUCT.compareAtPrice
    ? Math.round(
        ((MOCK_PRODUCT.compareAtPrice - MOCK_PRODUCT.price) / MOCK_PRODUCT.compareAtPrice) * 100
      )
    : null;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="text-muted-foreground size-4" />
          <Link href="/browse" className="text-muted-foreground hover:text-foreground">
            Browse
          </Link>
          <ChevronRight className="text-muted-foreground size-4" />
          <span className="text-foreground">Organic Cotton Tote Bag</span>
        </nav>

        {/* Product Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <Image
                src={MOCK_PRODUCT.images[selectedImageIndex].url}
                alt={MOCK_PRODUCT.images[selectedImageIndex].alt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {MOCK_PRODUCT.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-md bg-neutral-100 transition-all dark:bg-neutral-800',
                    selectedImageIndex === index
                      ? 'ring-forest-dark ring-2'
                      : 'opacity-60 hover:opacity-100'
                  )}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            {/* Title & Price */}
            <div>
              <h1 className="mb-3 text-3xl font-bold md:text-4xl">{MOCK_PRODUCT.title}</h1>

              <div className="mb-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold">{formattedPrice}</span>
                {formattedComparePrice && (
                  <>
                    <span className="text-muted-foreground text-xl line-through">
                      {formattedComparePrice}
                    </span>
                    <span className="bg-eco-light text-forest-dark rounded-full px-2 py-1 text-sm font-semibold">
                      Save {discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Rating */}
              <div className="mb-4 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'size-5',
                        i < Math.floor(MOCK_PRODUCT.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-neutral-300'
                      )}
                    />
                  ))}
                </div>
                <span className="font-semibold">{MOCK_PRODUCT.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({MOCK_PRODUCT.reviewCount} reviews)</span>
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap gap-2">
                {MOCK_PRODUCT.certifications.map((cert) => (
                  <EcoBadge key={cert} variant={cert} size="md" />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="border-border border-y py-6">
              <p className="text-muted-foreground leading-relaxed">{MOCK_PRODUCT.description}</p>
            </div>

            {/* Seller & Nonprofit */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative size-12 overflow-hidden rounded-full">
                  <Image
                    src={MOCK_PRODUCT.seller.avatar}
                    alt={MOCK_PRODUCT.seller.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <Link
                    href={`/shop/${MOCK_PRODUCT.seller.slug}`}
                    className="font-semibold hover:underline"
                  >
                    {MOCK_PRODUCT.seller.name}
                  </Link>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                    <span>{MOCK_PRODUCT.seller.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({MOCK_PRODUCT.seller.reviewCount})
                    </span>
                    <span className="text-muted-foreground">
                      • {MOCK_PRODUCT.seller.joinedDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-eco-light/30 border-eco-light flex items-center gap-3 rounded-lg border p-4">
                <Leaf className="text-forest-dark size-8 shrink-0" />
                <div className="flex-1">
                  <p className="text-forest-dark text-sm font-semibold">
                    {MOCK_PRODUCT.nonprofit.donationPercentage}% of this purchase supports
                  </p>
                  <p className="text-forest-dark font-bold">{MOCK_PRODUCT.nonprofit.name}</p>
                </div>
              </div>
            </div>

            {/* Stock & SKU */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                SKU: <span className="text-foreground font-mono">{MOCK_PRODUCT.sku}</span>
              </span>
              <span className="text-eco-dark font-semibold">{MOCK_PRODUCT.stock} in stock</span>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex gap-3">
              <div className="flex items-center rounded-md border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 border-x py-2 text-center"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  +
                </button>
              </div>

              <Button size="lg" className="flex-1 gap-2" onClick={() => alert('Added to cart!')}>
                <ShoppingCart className="size-5" />
                Add to Cart
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsFavorited(!isFavorited)}
                className={cn(
                  isFavorited && 'bg-pink-50 text-pink-600 hover:bg-pink-100 hover:text-pink-700'
                )}
              >
                <Heart className={cn('size-5', isFavorited && 'fill-current')} />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 border-t pt-6">
              <div className="text-center">
                <Shield className="text-eco-dark mx-auto mb-2 size-6" />
                <p className="text-xs font-semibold">Verified Sustainable</p>
              </div>
              <div className="text-center">
                <Truck className="text-eco-dark mx-auto mb-2 size-6" />
                <p className="text-xs font-semibold">Free Shipping $50+</p>
              </div>
              <div className="text-center">
                <Package className="text-eco-dark mx-auto mb-2 size-6" />
                <p className="text-xs font-semibold">Eco Packaging</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sustainability Details */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Eco Attributes */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-6 text-2xl font-bold">Sustainability Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground mb-1 text-sm font-semibold">Material</p>
                <p className="text-foreground">{MOCK_PRODUCT.ecoAttributes.material}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-sm font-semibold">Packaging</p>
                <p className="text-foreground">{MOCK_PRODUCT.ecoAttributes.packaging}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-sm font-semibold">Carbon Footprint</p>
                <p className="text-foreground">{MOCK_PRODUCT.ecoAttributes.carbonFootprint}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-sm font-semibold">Made In</p>
                <p className="text-foreground">{MOCK_PRODUCT.ecoAttributes.madeIn}</p>
              </div>
            </div>
          </div>

          {/* Sustainability Score */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-6 text-2xl font-bold">Sustainability Score</h2>
            <SustainabilityScore
              totalScore={MOCK_PRODUCT.sustainabilityScore.total}
              materialsScore={MOCK_PRODUCT.sustainabilityScore.materials}
              packagingScore={MOCK_PRODUCT.sustainabilityScore.packaging}
              carbonScore={MOCK_PRODUCT.sustainabilityScore.carbon}
              certificationScore={MOCK_PRODUCT.sustainabilityScore.certifications}
            />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            <Button variant="outline">Write a Review</Button>
          </div>

          <div className="space-y-6">
            {MOCK_REVIEWS.map((review) => (
              <div key={review.id} className="bg-card rounded-lg border p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold">{review.author}</span>
                      {review.verified && (
                        <span className="bg-eco-light text-forest-dark rounded-full px-2 py-0.5 text-xs font-semibold">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'size-4',
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-neutral-300'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-muted-foreground text-sm">{review.date}</span>
                </div>
                <p className="text-muted-foreground">{review.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RELATED_PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                seller={product.seller}
                nonprofit={product.nonprofit}
                certifications={product.certifications}
                rating={product.rating}
                reviewCount={product.reviewCount}
                isFavorited={relatedFavorites[product.id]}
                onFavoriteClick={() =>
                  setRelatedFavorites((prev) => ({ ...prev, [product.id]: !prev[product.id] }))
                }
                onQuickAddClick={() => alert('Added to cart!')}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
