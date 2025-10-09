/**
 * Shop Hero Component
 *
 * Two distinct layouts:
 * - WITHOUT banner: Clean horizontal header (intentional, complete)
 * - WITH banner: Full hero with overlaying logo (premium, visual)
 */

import Image from 'next/image';
import { ShieldCheck, Calendar } from 'lucide-react';

interface ShopHeroProps {
  name: string;
  logo: string | null;
  bannerImage: string | null;
  isVerified: boolean;
  createdAt: Date;
  bio: string | null;
  productCount: number;
  reviewCount: number;
  averageRating: number;
}

export function ShopHero({
  name,
  logo,
  bannerImage,
  isVerified,
  createdAt,
  bio,
  productCount,
  reviewCount,
  averageRating,
}: ShopHeroProps) {
  const shopAge = new Date().getFullYear() - new Date(createdAt).getFullYear();
  const memberSince =
    shopAge > 0 ? `Member since ${new Date(createdAt).getFullYear()}` : 'New member';

  // Render different layouts based on banner presence
  if (!bannerImage) {
    // Clean horizontal header layout (no banner)
    return (
      <div className="border-b bg-neutral-50/50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            {/* Logo */}
            <div className="relative size-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-white bg-white shadow-md md:size-24">
              {logo ? (
                <Image src={logo} alt={`${name} logo`} fill className="object-cover" sizes="96px" />
              ) : (
                <div className="bg-eco-light text-forest flex size-full items-center justify-center text-3xl font-bold">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Shop Details */}
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold md:text-3xl">{name}</h1>
                {isVerified && (
                  <div className="bg-eco-light text-forest-dark flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold">
                    <ShieldCheck className="size-4" />
                    Verified
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="text-muted-foreground mb-2 flex flex-wrap items-center gap-2 text-sm md:gap-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  <span>{memberSince}</span>
                </div>
                <span>·</span>
                <span>{productCount} products</span>
                {reviewCount > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      ⭐ {averageRating.toFixed(1)} ({reviewCount} reviews)
                    </span>
                  </>
                )}
              </div>

              {/* Bio */}
              {bio && (
                <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">{bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full hero layout with banner image
  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="relative h-48 overflow-hidden md:h-64">
        <Image
          src={bannerImage}
          alt={`${name} banner`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
      </div>

      {/* Shop Info */}
      <div className="relative container mx-auto px-4">
        <div className="-mt-16 md:-mt-20">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end">
            {/* Logo */}
            <div className="relative size-32 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg md:size-40">
              {logo ? (
                <Image
                  src={logo}
                  alt={`${name} logo`}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              ) : (
                <div className="bg-eco-light text-forest flex size-full items-center justify-center text-4xl font-bold md:text-5xl">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Shop Details */}
            <div className="flex-1 pb-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold md:text-4xl">{name}</h1>
                {isVerified && (
                  <div className="bg-eco-light text-forest-dark flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold">
                    <ShieldCheck className="size-4" />
                    Verified
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-3 text-sm md:gap-4 md:text-base">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  <span>{memberSince}</span>
                </div>
                <span>·</span>
                <span>{productCount} products</span>
                {reviewCount > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      ⭐ {averageRating.toFixed(1)} ({reviewCount} reviews)
                    </span>
                  </>
                )}
              </div>

              {/* Bio */}
              {bio && (
                <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed md:text-base">
                  {bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
