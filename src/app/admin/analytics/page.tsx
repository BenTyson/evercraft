/**
 * Admin Analytics Dashboard
 *
 * Comprehensive analytics and business intelligence page.
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import {
  getAnalyticsOverview,
  getRevenueAnalytics,
  getRevenueForecast,
  getUserAnalytics,
  getCohortAnalysis,
  getUserBehavior,
  getSellerAnalytics,
  getTopSellers,
  getProductAnalytics,
  getCategoryAnalytics,
  getInventoryInsights,
  getOrderAnalytics,
  getPaymentAnalytics,
} from '@/actions/admin-analytics';
import AnalyticsTabs from './analytics-tabs';

export default async function AnalyticsPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/?error=unauthorized');
  }

  // Fetch all analytics data in parallel
  const [
    overviewResult,
    revenueResult,
    forecastResult,
    userResult,
    cohortResult,
    behaviorResult,
    sellerResult,
    topSellersResult,
    productResult,
    categoryResult,
    inventoryResult,
    orderResult,
    paymentResult,
  ] = await Promise.all([
    getAnalyticsOverview(),
    getRevenueAnalytics(12),
    getRevenueForecast(3),
    getUserAnalytics(12),
    getCohortAnalysis(),
    getUserBehavior(),
    getSellerAnalytics(),
    getTopSellers(20, 'revenue'),
    getProductAnalytics(),
    getCategoryAnalytics(),
    getInventoryInsights(),
    getOrderAnalytics(12),
    getPaymentAnalytics(),
  ]);

  if (!overviewResult.success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-red-600">Error loading analytics data</h1>
        <p className="mt-2 text-gray-600">{overviewResult.error}</p>
      </div>
    );
  }

  const overview = overviewResult.overview!;
  const revenueAnalytics = revenueResult.success ? revenueResult.analytics! : null;
  const revenueForecast = forecastResult.success ? forecastResult.forecast! : null;
  const userAnalytics = userResult.success ? userResult.analytics! : null;
  const cohortAnalytics = cohortResult.success ? cohortResult.cohorts! : null;
  const userBehavior = behaviorResult.success ? behaviorResult.behavior! : null;
  const sellerAnalytics = sellerResult.success ? sellerResult.analytics! : null;
  const topSellers = topSellersResult.success ? topSellersResult.topSellers! : [];
  const productAnalytics = productResult.success ? productResult.analytics! : null;
  const categoryAnalytics = categoryResult.success ? categoryResult.categories! : [];
  const inventoryInsights = inventoryResult.success ? inventoryResult.lowStock! : [];
  const orderAnalytics = orderResult.success ? orderResult.analytics! : null;
  const paymentAnalytics = paymentResult.success ? paymentResult.analytics : null;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="mt-2 text-gray-600">
          Comprehensive insights and business intelligence
        </p>
      </div>

      {/* Tabbed Analytics */}
      <AnalyticsTabs
        overview={overview}
        revenueAnalytics={revenueAnalytics}
        revenueForecast={revenueForecast}
        topSellers={topSellers}
        userAnalytics={userAnalytics}
        cohortAnalytics={cohortAnalytics}
        userBehavior={userBehavior}
        sellerAnalytics={sellerAnalytics}
        productAnalytics={productAnalytics}
        categoryAnalytics={categoryAnalytics}
        inventoryInsights={inventoryInsights}
        orderAnalytics={orderAnalytics}
        paymentAnalytics={paymentAnalytics}
      />
    </div>
  );
}
