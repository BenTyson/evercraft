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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Product</h1>
        <p className="text-muted-foreground mt-1">Add a new sustainable product to your shop</p>
      </div>

      <ProductForm
        shopId={shop.id}
        categories={categories}
        certifications={certifications}
        sections={sections}
        shippingProfiles={shippingProfiles}
      />
    </div>
  );
}
