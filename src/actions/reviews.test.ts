import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import {
  createReview,
  getProductReviews,
  getReviewStats,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getUserReviews,
  canUserReview,
} from './reviews';

// Mock Clerk auth
const mockAuth = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

// Mock syncUserToDatabase
vi.mock('@/lib/auth', () => ({
  syncUserToDatabase: vi.fn().mockResolvedValue(undefined),
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Sample mock data
const mockReview = {
  id: 'review_123',
  productId: 'prod_123',
  userId: 'user_123',
  orderId: 'order_123',
  rating: 5,
  text: 'Great eco-friendly product!',
  images: [],
  isVerifiedPurchase: true,
  helpfulCount: 3,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  user: { name: 'Jane Doe' },
};

const mockOrder = {
  id: 'order_123',
  orderNumber: 'ORD-001',
  buyerId: 'user_123',
};

describe('reviews server actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('createReview', () => {
    it('creates review successfully with verified purchase', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findFirst.mockResolvedValue(null); // No existing review
      mockDb.order.findFirst.mockResolvedValue(mockOrder); // Has purchased
      mockDb.review.create.mockResolvedValue(mockReview);

      const result = await createReview({
        productId: 'prod_123',
        rating: 5,
        text: 'Great product!',
        orderId: 'order_123',
      });

      expect(result.success).toBe(true);
      expect(result.review).toBeDefined();
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await createReview({
        productId: 'prod_123',
        rating: 5,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('validates rating must be between 1 and 5', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      const result = await createReview({
        productId: 'prod_123',
        rating: 6,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rating must be between 1 and 5');
    });

    it('validates rating cannot be less than 1', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      const result = await createReview({
        productId: 'prod_123',
        rating: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rating must be between 1 and 5');
    });

    it('prevents duplicate reviews from same user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findFirst.mockResolvedValue(mockReview);

      const result = await createReview({
        productId: 'prod_123',
        rating: 4,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('You have already reviewed this product');
    });

    it('sets isVerifiedPurchase based on order history', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findFirst.mockResolvedValue(null);
      mockDb.order.findFirst.mockResolvedValue(mockOrder);
      mockDb.review.create.mockResolvedValue({ ...mockReview, isVerifiedPurchase: true });

      await createReview({
        productId: 'prod_123',
        rating: 5,
      });

      expect(mockDb.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isVerifiedPurchase: true,
          }),
        })
      );
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findFirst.mockRejectedValue(new Error('Database error'));

      const result = await createReview({
        productId: 'prod_123',
        rating: 5,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getProductReviews', () => {
    const mockReviewsList = [mockReview, { ...mockReview, id: 'review_456', rating: 4 }];

    it('returns reviews with pagination', async () => {
      mockDb.review.findMany.mockResolvedValue(mockReviewsList);
      mockDb.review.count.mockResolvedValue(2);
      mockDb.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: { rating: 2 },
      });

      const result = await getProductReviews('prod_123');

      expect(result.success).toBe(true);
      expect(result.reviews).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.averageRating).toBe(4.5);
    });

    it('applies limit and offset', async () => {
      mockDb.review.findMany.mockResolvedValue([]);
      mockDb.review.count.mockResolvedValue(0);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: null }, _count: { rating: 0 } });

      await getProductReviews('prod_123', { limit: 5, offset: 10 });

      expect(mockDb.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 10,
        })
      );
    });

    it('filters verified purchases only', async () => {
      mockDb.review.findMany.mockResolvedValue([]);
      mockDb.review.count.mockResolvedValue(0);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: null }, _count: { rating: 0 } });

      await getProductReviews('prod_123', { verifiedOnly: true });

      expect(mockDb.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productId: 'prod_123', isVerifiedPurchase: true },
        })
      );
    });

    it('sorts by helpful count', async () => {
      mockDb.review.findMany.mockResolvedValue([]);
      mockDb.review.count.mockResolvedValue(0);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: null }, _count: { rating: 0 } });

      await getProductReviews('prod_123', { sortBy: 'helpful' });

      expect(mockDb.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { helpfulCount: 'desc' },
        })
      );
    });

    it('sorts by rating high to low', async () => {
      mockDb.review.findMany.mockResolvedValue([]);
      mockDb.review.count.mockResolvedValue(0);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: null }, _count: { rating: 0 } });

      await getProductReviews('prod_123', { sortBy: 'rating_high' });

      expect(mockDb.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { rating: 'desc' },
        })
      );
    });

    it('returns error on database failure', async () => {
      mockDb.review.findMany.mockRejectedValue(new Error('Query failed'));

      const result = await getProductReviews('prod_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query failed');
    });
  });

  describe('getReviewStats', () => {
    it('returns aggregate stats and distribution', async () => {
      mockDb.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.2 },
        _count: { rating: 100 },
      });
      mockDb.review.groupBy.mockResolvedValue([
        { rating: 5, _count: { rating: 50 } },
        { rating: 4, _count: { rating: 30 } },
        { rating: 3, _count: { rating: 15 } },
        { rating: 2, _count: { rating: 3 } },
        { rating: 1, _count: { rating: 2 } },
      ]);

      const result = await getReviewStats('prod_123');

      expect(result.success).toBe(true);
      expect(result.averageRating).toBe(4.2);
      expect(result.totalReviews).toBe(100);
      expect(result.distribution).toEqual({
        5: 50,
        4: 30,
        3: 15,
        2: 3,
        1: 2,
      });
    });

    it('returns zero distribution for products with no reviews', async () => {
      mockDb.review.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { rating: 0 },
      });
      mockDb.review.groupBy.mockResolvedValue([]);

      const result = await getReviewStats('prod_123');

      expect(result.success).toBe(true);
      expect(result.averageRating).toBe(0);
      expect(result.distribution).toEqual({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    });

    it('returns error on database failure', async () => {
      mockDb.review.aggregate.mockRejectedValue(new Error('Aggregate failed'));

      const result = await getReviewStats('prod_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Aggregate failed');
    });
  });

  describe('updateReview', () => {
    it('updates review successfully for owner', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findUnique.mockResolvedValue(mockReview);
      mockDb.review.update.mockResolvedValue({ ...mockReview, text: 'Updated review' });

      const result = await updateReview('review_123', { text: 'Updated review' });

      expect(result.success).toBe(true);
      expect(result.review?.text).toBe('Updated review');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await updateReview('review_123', { text: 'Updated' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('returns error when review not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findUnique.mockResolvedValue(null);

      const result = await updateReview('nonexistent', { text: 'Updated' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Review not found');
    });

    it('prevents editing reviews from other users', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_456' });
      mockDb.review.findUnique.mockResolvedValue(mockReview); // Owned by user_123

      const result = await updateReview('review_123', { text: 'Hacked!' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('You can only edit your own reviews');
    });

    it('validates updated rating', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findUnique.mockResolvedValue(mockReview);

      const result = await updateReview('review_123', { rating: 10 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rating must be between 1 and 5');
    });
  });

  describe('deleteReview', () => {
    it('deletes review successfully for owner', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findUnique.mockResolvedValue(mockReview);
      mockDb.review.delete.mockResolvedValue(mockReview);

      const result = await deleteReview('review_123');

      expect(result.success).toBe(true);
      expect(mockDb.review.delete).toHaveBeenCalledWith({
        where: { id: 'review_123' },
      });
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await deleteReview('review_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('prevents deleting reviews from other users', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_456' });
      mockDb.review.findUnique.mockResolvedValue(mockReview);

      const result = await deleteReview('review_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('You can only delete your own reviews');
    });

    it('returns error when review not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findUnique.mockResolvedValue(null);

      const result = await deleteReview('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Review not found');
    });
  });

  describe('markReviewHelpful', () => {
    it('increments helpful count', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.update.mockResolvedValue({ ...mockReview, helpfulCount: 4 });

      const result = await markReviewHelpful('review_123');

      expect(result.success).toBe(true);
      expect(mockDb.review.update).toHaveBeenCalledWith({
        where: { id: 'review_123' },
        data: {
          helpfulCount: { increment: 1 },
        },
      });
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await markReviewHelpful('review_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('returns error on database failure', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.update.mockRejectedValue(new Error('Update failed'));

      const result = await markReviewHelpful('review_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('getUserReviews', () => {
    const mockReviewWithProduct = {
      ...mockReview,
      product: {
        id: 'prod_123',
        title: 'Eco Bottle',
        images: [{ url: 'https://example.com/img.jpg', altText: 'Bottle' }],
      },
    };

    it('returns user reviews with product details', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findMany.mockResolvedValue([mockReviewWithProduct]);

      const result = await getUserReviews();

      expect(result.success).toBe(true);
      expect(result.reviews).toHaveLength(1);
      expect(result.reviews![0].product.title).toBe('Eco Bottle');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getUserReviews();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('orders by createdAt descending', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findMany.mockResolvedValue([]);

      await getUserReviews();

      expect(mockDb.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  describe('canUserReview', () => {
    it('returns canReview true with order for verified purchase', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findFirst.mockResolvedValue(null);
      mockDb.order.findFirst.mockResolvedValue(mockOrder);

      const result = await canUserReview('prod_123');

      expect(result.success).toBe(true);
      expect(result.canReview).toBe(true);
      expect(result.order).toBeDefined();
    });

    it('returns canReview false if already reviewed', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findFirst.mockResolvedValue(mockReview);

      const result = await canUserReview('prod_123');

      expect(result.success).toBe(true);
      expect(result.canReview).toBe(false);
      expect(result.reason).toBe('You have already reviewed this product');
    });

    it('returns canReview true without order for non-verified review', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockDb.review.findFirst.mockResolvedValue(null);
      mockDb.order.findFirst.mockResolvedValue(null);

      const result = await canUserReview('prod_123');

      expect(result.success).toBe(true);
      expect(result.canReview).toBe(true);
      expect(result.reason).toContain('not a verified purchase');
    });

    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await canUserReview('prod_123');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Not authenticated');
    });
  });
});
