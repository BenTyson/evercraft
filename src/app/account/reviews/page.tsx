import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
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
      <div className="px-6 py-12">
        <h1 className="mb-6 text-3xl font-bold">My Reviews</h1>
        <p className="text-red-600">Failed to load reviews: {result.error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">
            My Reviews
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-8">
        {result.reviews && result.reviews.length > 0 ? (
          <UserReviewsList reviews={result.reviews} />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-muted-foreground mb-4">You haven&apos;t written any reviews yet.</p>
            <a href="/browse" className="text-forest-dark font-semibold hover:underline">
              Browse products to review
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
