import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { SiteHeader } from '@/components/layout/site-header';
import { getUserReviews } from '@/actions/reviews';
import { UserReviewsList } from './user-reviews-list';

export default async function UserReviewsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const result = await getUserReviews();

  if (!result.success) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="container mx-auto px-4 py-12">
          <h1 className="mb-6 text-3xl font-bold">My Reviews</h1>
          <p className="text-red-600">Failed to load reviews: {result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Reviews</h1>
          <p className="text-muted-foreground mt-2">
            Manage your product reviews and feedback
          </p>
        </div>

        {result.reviews && result.reviews.length > 0 ? (
          <UserReviewsList reviews={result.reviews} />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-muted-foreground mb-4">You haven&apos;t written any reviews yet.</p>
            <a
              href="/browse"
              className="text-eco-dark hover:underline font-semibold"
            >
              Browse products to review
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
