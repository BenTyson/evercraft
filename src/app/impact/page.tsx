/**
 * Impact Dashboard Page
 *
 * Displays user's environmental impact and nonprofit contributions.
 * Shows metrics like carbon saved, plastic avoided, and donations made.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Leaf, Heart, Droplet, TreePine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/site-header';
import { ImpactWidget } from '@/components/eco/impact-widget';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with actual user data from API/database
const USER_IMPACT = {
  totalOrders: 23,
  totalSpent: 1247.89,
  carbonSaved: 145, // kg CO2
  plasticAvoided: 12.5, // kg
  donationsToNonprofits: 62.39, // USD
  treesPlanted: 8,
};

const NONPROFIT_CONTRIBUTIONS = [
  {
    id: '1',
    name: 'Ocean Conservancy',
    logo: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&q=80',
    totalDonated: 24.5,
    orderCount: 8,
    description: 'Protecting ocean ecosystems and reducing plastic pollution',
  },
  {
    id: '2',
    name: 'Rainforest Alliance',
    logo: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200&q=80',
    totalDonated: 18.75,
    orderCount: 6,
    description: 'Conserving biodiversity and sustainable livelihoods',
  },
  {
    id: '3',
    name: 'Fair Trade Federation',
    logo: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&q=80',
    totalDonated: 12.5,
    orderCount: 5,
    description: 'Supporting fair wages and ethical trade practices',
  },
  {
    id: '4',
    name: 'The Nature Conservancy',
    logo: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=80',
    totalDonated: 6.64,
    orderCount: 4,
    description: 'Protecting lands and waters worldwide',
  },
];

const RECENT_MILESTONES = [
  {
    id: '1',
    icon: TreePine,
    title: 'Planted 8 Trees',
    description: 'Your purchases helped plant 8 trees through our carbon offset program',
    date: '2 weeks ago',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: '2',
    icon: Droplet,
    title: '10kg Plastic Avoided',
    description: 'Milestone reached! You have avoided 10kg of single-use plastic',
    date: '1 month ago',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: '3',
    icon: Heart,
    title: '$50 Donated',
    description: 'Your purchases contributed $50 to environmental nonprofits',
    date: '2 months ago',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
];

const COMMUNITY_IMPACT = {
  totalOrders: 125834,
  totalDonations: 2145789.45,
  carbonOffset: 458932, // kg CO2
  plasticAvoided: 38567, // kg
  treesPlanted: 12456,
  nonprofitsSupported: 42,
};

export default function ImpactDashboardPage() {
  const formattedDonations = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(USER_IMPACT.donationsToNonprofits);

  const formattedCommunityDonations = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(COMMUNITY_IMPACT.totalDonations);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="from-eco-light/30 to-background mb-8 rounded-2xl border bg-gradient-to-br p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="bg-eco-light text-forest-dark mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
              <Leaf className="size-4" />
              Your Environmental Impact
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Making a Difference, <span className="text-forest-dark">One Purchase at a Time</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your positive impact on the planet and see how your sustainable choices are
              creating real change.
            </p>
          </div>
        </div>

        {/* Personal Impact Metrics */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Your Impact Summary</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Carbon Saved */}
            <div className="bg-card group rounded-lg border p-6 transition-all hover:shadow-md">
              <div className="bg-eco-light text-forest-dark mb-4 inline-flex rounded-full p-3">
                <Leaf className="size-6" />
              </div>
              <p className="text-muted-foreground mb-1 text-sm font-semibold tracking-wide uppercase">
                Carbon Saved
              </p>
              <p className="text-3xl font-bold">
                {USER_IMPACT.carbonSaved}
                <span className="text-muted-foreground text-lg font-normal"> kg CO₂</span>
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Equivalent to {Math.round(USER_IMPACT.carbonSaved / 21)} trees planted
              </p>
            </div>

            {/* Plastic Avoided */}
            <div className="bg-card group rounded-lg border p-6 transition-all hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-blue-50 p-3 text-blue-600">
                <Droplet className="size-6" />
              </div>
              <p className="text-muted-foreground mb-1 text-sm font-semibold tracking-wide uppercase">
                Plastic Avoided
              </p>
              <p className="text-3xl font-bold">
                {USER_IMPACT.plasticAvoided}
                <span className="text-muted-foreground text-lg font-normal"> kg</span>
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                That is {Math.round(USER_IMPACT.plasticAvoided * 50)} plastic bottles
              </p>
            </div>

            {/* Donations */}
            <div className="bg-card group rounded-lg border p-6 transition-all hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-pink-50 p-3 text-pink-600">
                <Heart className="size-6" />
              </div>
              <p className="text-muted-foreground mb-1 text-sm font-semibold tracking-wide uppercase">
                Nonprofit Donations
              </p>
              <p className="text-3xl font-bold">{formattedDonations}</p>
              <p className="text-muted-foreground mt-2 text-sm">
                Across {NONPROFIT_CONTRIBUTIONS.length} organizations
              </p>
            </div>

            {/* Trees Planted */}
            <div className="bg-card group rounded-lg border p-6 transition-all hover:shadow-md">
              <div className="mb-4 inline-flex rounded-full bg-green-50 p-3 text-green-600">
                <TreePine className="size-6" />
              </div>
              <p className="text-muted-foreground mb-1 text-sm font-semibold tracking-wide uppercase">
                Trees Planted
              </p>
              <p className="text-3xl font-bold">{USER_IMPACT.treesPlanted}</p>
              <p className="text-muted-foreground mt-2 text-sm">Through carbon offset programs</p>
            </div>
          </div>
        </div>

        {/* Nonprofit Contributions */}
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Nonprofits You&apos;ve Supported</h2>
            <Button variant="outline" asChild>
              <Link href="/nonprofits">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {NONPROFIT_CONTRIBUTIONS.map((nonprofit) => {
              const formattedAmount = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(nonprofit.totalDonated);

              return (
                <div
                  key={nonprofit.id}
                  className="bg-card group flex gap-4 rounded-lg border p-6 transition-all hover:shadow-md"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={nonprofit.logo}
                      alt={nonprofit.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-bold">{nonprofit.name}</h3>
                    <p className="text-muted-foreground mb-3 text-sm">{nonprofit.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-forest-dark font-bold">{formattedAmount}</p>
                        <p className="text-muted-foreground text-xs">donated</p>
                      </div>
                      <div>
                        <p className="font-semibold">{nonprofit.orderCount}</p>
                        <p className="text-muted-foreground text-xs">purchases</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Milestones */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Recent Milestones</h2>
          <div className="space-y-4">
            {RECENT_MILESTONES.map((milestone) => {
              const Icon = milestone.icon;
              return (
                <div
                  key={milestone.id}
                  className="bg-card flex items-start gap-4 rounded-lg border p-6"
                >
                  <div className={cn('rounded-full p-3', milestone.bgColor)}>
                    <Icon className={cn('size-6', milestone.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-start justify-between">
                      <h3 className="font-bold">{milestone.title}</h3>
                      <span className="text-muted-foreground text-sm">{milestone.date}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{milestone.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Community Impact */}
        <div className="from-forest-dark to-eco-dark rounded-2xl bg-gradient-to-br p-8 text-white md:p-12">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold">Our Community&apos;s Impact</h2>
            <p className="text-neutral-100">
              Together, Evercraft shoppers are making a real difference
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            <div className="text-center">
              <p className="mb-1 text-3xl font-bold">
                {(COMMUNITY_IMPACT.totalOrders / 1000).toFixed(0)}K+
              </p>
              <p className="text-sm text-neutral-100">Orders Placed</p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-3xl font-bold">{formattedCommunityDonations}</p>
              <p className="text-sm text-neutral-100">Donated</p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-3xl font-bold">
                {(COMMUNITY_IMPACT.carbonOffset / 1000).toFixed(0)}t
              </p>
              <p className="text-sm text-neutral-100">CO₂ Offset</p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-3xl font-bold">
                {(COMMUNITY_IMPACT.plasticAvoided / 1000).toFixed(1)}t
              </p>
              <p className="text-sm text-neutral-100">Plastic Avoided</p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-3xl font-bold">
                {(COMMUNITY_IMPACT.treesPlanted / 1000).toFixed(1)}K
              </p>
              <p className="text-sm text-neutral-100">Trees Planted</p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-3xl font-bold">{COMMUNITY_IMPACT.nonprofitsSupported}</p>
              <p className="text-sm text-neutral-100">Nonprofits</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/browse">
                Continue Shopping
                <Leaf className="ml-2 size-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Impact Widget Example */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Your Latest Impact</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ImpactWidget
              metrics={[
                { type: 'carbon', value: 12.5, label: 'kg CO₂ saved' },
                { type: 'plastic', value: 0.8, label: 'kg plastic avoided' },
              ]}
              nonprofit={{
                name: 'Ocean Conservancy',
                logo: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&q=80',
                donationAmount: 3.5,
              }}
            />
            <ImpactWidget
              metrics={[
                { type: 'trees', value: 2, label: 'trees planted' },
                { type: 'water', value: 450, label: 'liters water saved' },
              ]}
              nonprofit={{
                name: 'Rainforest Alliance',
                logo: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200&q=80',
                donationAmount: 2.25,
              }}
            />
            <ImpactWidget
              metrics={[
                { type: 'carbon', value: 8.3, label: 'kg CO₂ saved' },
                { type: 'waste', value: 1.2, label: 'kg waste diverted' },
              ]}
              nonprofit={{
                name: 'The Nature Conservancy',
                logo: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=80',
                donationAmount: 1.8,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
