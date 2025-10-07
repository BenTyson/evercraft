import { NextRequest, NextResponse } from 'next/server';
import { markReviewHelpful } from '@/actions/reviews';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const reviewId = params.id;

  if (!reviewId) {
    return NextResponse.json(
      { success: false, error: 'Review ID is required' },
      { status: 400 }
    );
  }

  const result = await markReviewHelpful(reviewId);

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
