/**
 * Seller Marketing Tools Page
 *
 * Manage promotions, discount codes, and marketing campaigns.
 */

import { redirect } from 'next/navigation';
import { isSeller } from '@/lib/auth';
import { getShopPromotions } from '@/actions/seller-promotions';
import { Tag } from 'lucide-react';
import PromotionsTable from './promotions-table';
import PromotionFormWrapper from './promotion-form-wrapper';

export default async function SellerMarketingPage() {
  const seller = await isSeller();

  if (!seller) {
    redirect('/?error=unauthorized');
  }

  const result = await getShopPromotions();

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-red-600">Error loading promotions</h1>
        <p className="mt-2 text-gray-600">{result.error}</p>
      </div>
    );
  }

  const promotions = result.promotions || [];
  const activePromotions = promotions.filter((p) => !p.isExpired && p.isActive);
  const totalUses = promotions.reduce((sum, p) => sum + p.currentUses, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Tools</h1>
          <p className="mt-2 text-gray-600">Create and manage discount codes and promotions</p>
        </div>
        <PromotionFormWrapper />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Promotions</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{promotions.length}</p>
              <p className="mt-1 text-sm text-gray-600">{activePromotions.length} active</p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <Tag className="size-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Redemptions</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalUses}</p>
              <p className="mt-1 text-sm text-gray-600">All time</p>
            </div>
            <div className="rounded-full bg-green-50 p-3">
              <Tag className="size-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Discount</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {promotions.length > 0
                  ? Math.round(
                      promotions.reduce((sum, p) => {
                        // Rough estimate - percentage-based promos
                        if (p.discountType === 'PERCENTAGE') {
                          return sum + p.discountValue;
                        }
                        // For fixed, estimate as percentage of average order
                        return sum + 15; // placeholder
                      }, 0) / promotions.length
                    )
                  : 0}
                %
              </p>
              <p className="mt-1 text-sm text-gray-600">Across all promos</p>
            </div>
            <div className="rounded-full bg-purple-50 p-3">
              <Tag className="size-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="font-semibold text-blue-900">💡 Marketing Tips</h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-800">
          <li>• Create urgency with limited-time offers (24-48 hours work best)</li>
          <li>• Set minimum purchase amounts to increase average order value</li>
          <li>• Track redemption rates to understand which promotions perform best</li>
          <li>• Consider seasonal promotions (holidays, back-to-school, etc.)</li>
        </ul>
      </div>

      {/* Promotions Table */}
      <div className="rounded-lg border bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Your Promotions</h2>
          <div className="flex gap-2">
            <button className="text-sm text-gray-600 hover:text-gray-900">
              All ({promotions.length})
            </button>
            <span className="text-gray-300">|</span>
            <button className="text-sm text-gray-600 hover:text-gray-900">
              Active ({activePromotions.length})
            </button>
            <span className="text-gray-300">|</span>
            <button className="text-sm text-gray-600 hover:text-gray-900">
              Expired ({promotions.filter((p) => p.isExpired).length})
            </button>
          </div>
        </div>

        <PromotionsTable
          promotions={promotions}
          onEdit={(promo) => {
            // This will be handled by the wrapper component
            console.log('Edit promotion:', promo);
          }}
        />
      </div>
    </div>
  );
}
