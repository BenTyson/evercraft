/**
 * Edit Product Page
 *
 * Form for sellers to edit an existing product.
 */

import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getCategories, getCertifications } from '@/actions/products';
import { getSellerShop } from '@/actions/seller-products';
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
    },
  });

  if (!product) {
    notFound();
  }

  // Verify that the product belongs to this seller's shop
  if (product.shopId !== shop.id) {
    redirect('/seller/products');
  }

  // Fetch categories and certifications for the form
  const categories = await getCategories();
  const certifications = await getCertifications();

  // Prepare initial data for the form
  const initialData = {
    title: product.title,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice || undefined,
    sku: product.sku || '',
    categoryId: product.categoryId,
    tags: product.tags || [],
    certificationIds: product.certifications.map((c) => c.id),
    ecoAttributes: (product.ecoAttributes as Record<string, any>) || {},
    images: product.images.map((img) => img.url),
    inventoryQuantity: product.inventoryQuantity,
    trackInventory: product.trackInventory,
    lowStockThreshold: product.lowStockThreshold ?? undefined,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground mt-1">Update your product information</p>
      </div>

      <ProductForm
        shopId={shop.id}
        categories={categories}
        certifications={certifications}
        initialData={initialData}
        productId={id}
        isEditing
      />
    </div>
  );
}
