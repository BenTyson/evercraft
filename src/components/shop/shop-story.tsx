/**
 * Shop Story Component
 *
 * Displays the shop's story section with nonprofit partnership card.
 */

import { NonprofitCard } from './nonprofit-card';

interface ShopStoryProps {
  story: string | null;
  nonprofit: {
    id: string;
    name: string;
    mission: string;
    logo: string | null;
    website: string | null;
    category: string[];
  } | null;
  donationPercentage: number;
}

export function ShopStory({ story, nonprofit, donationPercentage }: ShopStoryProps) {
  // Don't render if no story or nonprofit
  if (!story && !nonprofit) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Story Content */}
        {story && (
          <div>
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">Our Story</h2>
            <div
              className="text-muted-foreground prose max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: story }}
            />
          </div>
        )}

        {/* Nonprofit Partnership */}
        {nonprofit && (
          <div className={story ? '' : 'lg:col-span-2'}>
            <h2 className={`mb-6 text-2xl font-bold md:text-3xl ${story ? 'lg:hidden' : ''}`}>
              Partnership
            </h2>
            <NonprofitCard nonprofit={nonprofit} donationPercentage={donationPercentage} />
          </div>
        )}
      </div>
    </section>
  );
}
