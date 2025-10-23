/**
 * Shop Hero Component
 *
 * Two distinct layouts:
 * - WITHOUT banner: Clean horizontal header (intentional, complete)
 * - WITH banner: Full hero with overlaying logo (premium, visual)
 *
 * Simplified for Faire-inspired clean aesthetic.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, MessageCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';

interface ShopHeroProps {
  userId: string;
  name: string;
  logo: string | null;
  bannerImage: string | null;
  isVerified: boolean;
  createdAt: Date;
  bio: string | null;
  reviewCount: number;
  averageRating: number;
}

export function ShopHero({
  userId,
  name,
  logo,
  bannerImage,
  isVerified,
  createdAt,
  bio,
  reviewCount,
  averageRating,
}: ShopHeroProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const shopAge = new Date().getFullYear() - new Date(createdAt).getFullYear();
  const memberSince =
    shopAge > 0 ? `Member since ${new Date(createdAt).getFullYear()}` : 'New member';

  // Show contact button if user is logged in and not the shop owner
  const showContactButton = isLoaded && isSignedIn && user?.id !== userId;

  // Render different layouts based on banner presence
  if (!bannerImage) {
    // Clean horizontal header layout (no banner)
    return (
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start gap-4 md:items-center">
            {/* Logo */}
            <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-full border bg-white shadow-sm md:size-20">
              {logo ? (
                <Image src={logo} alt={`${name} logo`} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="bg-eco-light text-forest flex size-full items-center justify-center text-2xl font-bold">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Shop Details */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold md:text-2xl">{name}</h1>
                {isVerified && (
                  <div className="bg-eco-light text-forest-dark flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                    <ShieldCheck className="size-3" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {/* Meta info - compact inline format */}
              <div className="text-muted-foreground mb-2 flex flex-wrap items-center gap-2 text-sm">
                {reviewCount > 0 ? (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-foreground font-medium">
                        {averageRating.toFixed(1)}
                      </span>
                      <span>({reviewCount})</span>
                    </span>
                    <span>·</span>
                  </>
                ) : null}
                <span>{memberSince}</span>
              </div>

              {/* Bio */}
              {bio && (
                <p className="text-muted-foreground mb-3 max-w-2xl text-sm leading-relaxed">
                  {bio}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-shrink-0 items-center gap-2">
              <Button variant="outline" size="sm">
                <Heart className="mr-1.5 size-4" />
                Follow
              </Button>
              {showContactButton && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/messages/${userId}`}>
                    <MessageCircle className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full hero layout with banner image
  return (
    <div>
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
      </div>

      {/* Shop Info - Below Banner */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start gap-4 md:items-center">
            {/* Logo */}
            <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-full border bg-white shadow-sm md:size-20">
              {logo ? (
                <Image src={logo} alt={`${name} logo`} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="bg-eco-light text-forest flex size-full items-center justify-center text-2xl font-bold">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Shop Details */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold md:text-2xl">{name}</h1>
                {isVerified && (
                  <div className="bg-eco-light text-forest-dark flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                    <ShieldCheck className="size-3" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {/* Meta info - compact inline format */}
              <div className="text-muted-foreground mb-2 flex flex-wrap items-center gap-2 text-sm">
                {reviewCount > 0 ? (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-foreground font-medium">
                        {averageRating.toFixed(1)}
                      </span>
                      <span>({reviewCount})</span>
                    </span>
                    <span>·</span>
                  </>
                ) : null}
                <span>{memberSince}</span>
              </div>

              {/* Bio */}
              {bio && (
                <p className="text-muted-foreground mb-3 max-w-2xl text-sm leading-relaxed">
                  {bio}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-shrink-0 items-center gap-2">
              <Button variant="outline" size="sm">
                <Heart className="mr-1.5 size-4" />
                Follow
              </Button>
              {showContactButton && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/messages/${userId}`}>
                    <MessageCircle className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
