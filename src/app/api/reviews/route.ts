import { NextRequest, NextResponse } from 'next/server';
import { getProductReviews } from '@/actions/reviews';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get('productId');
  const sortBy = searchParams.get('sortBy') as 'recent' | 'helpful' | 'rating_high' | 'rating_low' | null;
  const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!productId) {
    return NextResponse.json(
      { success: false, error: 'Product ID is required' },
      { status: 400 }
    );
  }

  const result = await getProductReviews(productId, {
    sortBy: sortBy || 'recent',
    verifiedOnly,
    limit,
    offset,
  });

  return NextResponse.json(result);
}
