/**
 * New Product Page
 *
 * Form for sellers to create a new product with sustainability data.
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCategories, getCertifications } from '@/actions/products';
import { getSellerShop } from '@/actions/seller-products';
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

  // Fetch categories and certifications for the form
  const categories = await getCategories();
  const certifications = await getCertifications();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Product</h1>
        <p className="text-muted-foreground mt-1">
          Add a new sustainable product to your shop
        </p>
      </div>

      <ProductForm
        shopId={shop.id}
        categories={categories}
        certifications={certifications}
      />
    </div>
  );
}
