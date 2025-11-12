/**
 * New Product Page
 *
 * Form for sellers to create a new product with sustainability data.
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCategoriesHierarchical, getCertifications } from '@/actions/products';
import { getSellerShop } from '@/actions/seller-products';
import { getShopSections } from '@/actions/shop-sections';
import { getShippingProfiles } from '@/actions/seller-settings';
import { ProductForm } from '../product-form';

export default async function NewProductPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { shop } = await getSellerShop(userId);

  if (!shop) {
    redirect('/seller');
  }

  // Fetch hierarchical categories, certifications, sections, and shipping profiles for the form
  const [categories, certifications, sectionsResult, shippingProfilesResult] = await Promise.all([
    getCategoriesHierarchical(),
    getCertifications(),
    getShopSections(shop.id, true), // Include hidden sections for editing
    getShippingProfiles(),
  ]);

  const sections = sectionsResult.success ? sectionsResult.sections : [];
  const shippingProfiles =
    shippingProfilesResult.success && shippingProfilesResult.profiles
      ? shippingProfilesResult.profiles
      : [];

  return (
    <div>
      {/* Page Header Bar */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">
            Create Product
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        <ProductForm
          shopId={shop.id}
          categories={categories}
          certifications={certifications}
          sections={sections}
          shippingProfiles={shippingProfiles}
        />
      </div>
    </div>
  );
}
