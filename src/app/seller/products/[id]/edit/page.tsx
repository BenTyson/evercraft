/**
 * Edit Product Page
 *
 * Form for sellers to edit an existing product.
 */

import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getCategoriesHierarchical, getCertifications } from '@/actions/products';
import { getSellerShop } from '@/actions/seller-products';
import { getShopSections } from '@/actions/shop-sections';
import { getShippingProfiles } from '@/actions/seller-settings';
import { db } from '@/lib/db';
import { ProductForm } from '../../product-form';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { shop } = await getSellerShop(userId);

  if (!shop) {
    redirect('/seller');
  }

  // Fetch the product and verify ownership
  const product = await db.product.findUnique({
    where: { id },
    include: {
      certifications: {
        select: {
          id: true,
        },
      },
      images: {
        orderBy: {
          position: 'asc',
        },
        select: {
          url: true,
        },
      },
      ecoProfile: true, // Include eco profile data for editing
      shopSections: {
        select: {
          sectionId: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Verify that the product belongs to this seller's shop
  if (product.shopId !== shop.id) {
    redirect('/seller/products');
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

  // Prepare initial data for the form
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialData: any = {
    title: product.title,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice || undefined,
    sku: product.sku || '',
    categoryId: product.categoryId || undefined,
    shippingProfileId: product.shippingProfileId || undefined,
    tags: product.tags || [],
    certificationIds: product.certifications.map((c) => c.id),
    sectionIds: product.shopSections.map((s) => s.sectionId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ecoAttributes: (product.ecoAttributes as Record<string, any>) || {},
    ecoProfile: product.ecoProfile || {},
    images: product.images.map((img) => img.url),
    inventoryQuantity: product.inventoryQuantity,
    trackInventory: product.trackInventory,
    lowStockThreshold: product.lowStockThreshold ?? undefined,
    status: product.status,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      <ProductForm
        shopId={shop.id}
        categories={categories}
        certifications={certifications}
        sections={sections}
        shippingProfiles={shippingProfiles}
        initialData={initialData}
        productId={id}
        isEditing
      />
    </div>
  );
}
