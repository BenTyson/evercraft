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

// Type for forecast prediction
interface ForecastPrediction {
  month: string;
  predictedRevenue: number;
  lowerBound: number;
  upperBound: number;
}

// Type for category analytics
interface CategoryData {
  category: string;
  productCount: number;
  revenue: number;
  orderCount: number;
  count?: number;
}

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
      <div className="px-6 py-12">
        <h1 className="text-3xl font-bold text-red-600">Error loading analytics data</h1>
        <p className="mt-2 text-gray-600">{overviewResult.error}</p>
      </div>
    );
  }

  const overview = overviewResult.overview!;
  const revenueAnalytics = revenueResult.success
    ? revenueResult.analytics!
    : {
        trends: [],
        categoryBreakdown: [],
        totalPlatformFees: 0,
        totalSellerPayouts: 0,
      };
  const revenueForecast = forecastResult.success
    ? (forecastResult.forecast!.predictions || []).map((p: ForecastPrediction) => ({
        month: p.month,
        projected: p.predictedRevenue,
        lowerBound: p.lowerBound,
        upperBound: p.upperBound,
      }))
    : [];
  const userAnalytics = userResult.success
    ? userResult.analytics!
    : {
        growthTrends: [],
        roleDistribution: [],
        averageLTV: 0,
        averageOrdersPerUser: 0,
      };
  const cohortAnalytics = cohortResult.success ? cohortResult.cohorts! : [];
  const userBehavior = behaviorResult.success
    ? behaviorResult.behavior!
    : {
        pageViews: [],
        searches: [],
        conversions: { cartAdditions: 0, checkouts: 0, completedOrders: 0, conversionRate: 0 },
        repeatPurchaseRate: 0,
        averagePurchaseFrequency: 0,
      };
  const sellerAnalytics = sellerResult.success
    ? sellerResult.analytics!
    : {
        totalSellers: 0,
        activeSellers: 0,
        inactiveSellers: 0,
        newSellers: 0,
        averageProductsPerSeller: 0,
        averageRevenuePerSeller: 0,
        sellerGrowth: [],
        activeRate: 0,
        newSellersThisMonth: 0,
      };
  const topSellers = topSellersResult.success ? topSellersResult.topSellers! : [];
  const productAnalytics = productResult.success
    ? productResult.analytics!
    : {
        totalProducts: 0,
        activeProducts: 0,
        productsAddedThisMonth: 0,
        averageProductsPerShop: 0,
      };
  const categoryAnalytics = categoryResult.success
    ? categoryResult.categories!.map((c: CategoryData) => ({
        ...c,
        count: c.productCount || c.count || 0,
      }))
    : [];
  const inventoryInsights = inventoryResult.success ? inventoryResult.lowStock! : [];
  const orderAnalytics = orderResult.success
    ? orderResult.analytics!
    : {
        orderVelocity: [],
        statusDistribution: [],
      };
  const paymentAnalytics =
    paymentResult.success && paymentResult.analytics
      ? paymentResult.analytics
      : {
          totalPayments: 0,
          successfulPayments: 0,
          failedPayments: 0,
          successRate: 0,
          statusBreakdown: [],
        };

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">
            Platform Analytics
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-8">
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
    </div>
  );
}
