/**
 * Nonprofit Card Component
 *
 * Displays the nonprofit partnership information for a shop.
 * Image-focused design with compact, efficient use of space.
 */

import Image from 'next/image';
import { Heart, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NonprofitCardProps {
  nonprofit: {
    id: string;
    name: string;
    mission: string;
    logo: string | null;
    website: string | null;
    category: string[];
  };
  donationPercentage: number;
}

export function NonprofitCard({ nonprofit, donationPercentage }: NonprofitCardProps) {
  return (
    <div className="bg-card group overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start md:gap-8">
        {/* Nonprofit Logo - Large and Prominent */}
        <div className="flex-shrink-0">
          <div className="relative mx-auto size-32 overflow-hidden rounded-lg bg-white shadow-sm md:mx-0 md:size-40">
            {nonprofit.logo ? (
              <Image
                src={nonprofit.logo}
                alt={`${nonprofit.name} logo`}
                fill
                className="object-contain p-4"
                sizes="160px"
              />
            ) : (
              <div className="bg-eco-light text-forest flex size-full items-center justify-center text-4xl font-bold">
                {nonprofit.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div>
            <h3 className="mb-2 text-xl font-bold">{nonprofit.name}</h3>
            <div className="flex flex-wrap gap-2">
              {nonprofit.category.slice(0, 3).map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Donation Badge */}
          <div className="bg-forest text-eco-light inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <Heart className="size-4 fill-current" />
            {donationPercentage}% of sales support this cause
          </div>

          {/* Mission Statement */}
          <p className="text-muted-foreground leading-relaxed">{nonprofit.mission}</p>

          {/* Learn More Link */}
          {nonprofit.website && (
            <a
              href={nonprofit.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-dark hover:text-forest inline-flex items-center gap-1.5 font-medium transition-colors"
            >
              Learn more about their work
              <ExternalLink className="size-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
