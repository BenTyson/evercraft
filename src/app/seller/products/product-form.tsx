/**
 * Product Form Component
 *
 * Client component for creating/editing products with validation.
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Eye, EyeOff, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/image-upload';
import {
  ProductEcoProfileForm,
  type ProductEcoProfileData,
} from '@/components/seller/product-eco-profile-form';
import { CascadingCategorySelect } from '@/components/categories/cascading-category-select';
import { VariantManager } from '@/components/seller/variant-manager';
import { createProduct, updateProduct, type CreateProductInput } from '@/actions/seller-products';
import { ProductStatus } from '@/generated/prisma';
import type { VariantOptionsData, VariantInput } from '@/types/variants';

interface HierarchicalCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
  children: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    productCount: number;
  }>;
}

interface Section {
  id: string;
  name: string;
  isVisible: boolean;
  _count: {
    products: number;
  };
}

interface ProductFormProps {
  shopId: string;
  categories: HierarchicalCategory[];
  certifications: Array<{ id: string; name: string; count: number }>;
  sections: Section[];
  initialData?: Partial<CreateProductInput>;
  productId?: string;
  isEditing?: boolean;
}

export function ProductForm({
  shopId,
  categories,
  certifications: _certifications,
  sections,
  initialData,
  productId,
  isEditing = false,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreateProductInput>>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    compareAtPrice: initialData?.compareAtPrice,
    sku: initialData?.sku || '',
    categoryId: initialData?.categoryId || '',
    shopId,
    tags: initialData?.tags || [],
    certificationIds: initialData?.certificationIds || [],
    sectionIds: initialData?.sectionIds || [],
    ecoAttributes: initialData?.ecoAttributes || {},
    ecoProfile: initialData?.ecoProfile || {},
    images: initialData?.images || [],
    inventoryQuantity: initialData?.inventoryQuantity ?? 0,
    trackInventory: initialData?.trackInventory ?? true,
    lowStockThreshold: initialData?.lowStockThreshold,
    status: initialData?.status || ProductStatus.DRAFT,
  });

  // Variant state
  const [hasVariants, setHasVariants] = useState(initialData?.hasVariants || false);
  const [variantOptions, setVariantOptions] = useState<VariantOptionsData | null>(
    initialData?.variantOptions || null
  );
  const [variants, setVariants] = useState<VariantInput[]>(initialData?.variants || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title || !formData.description || !formData.categoryId) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate based on variant mode
    if (hasVariants) {
      if (!variants || variants.length === 0) {
        setError('Please generate at least one variant');
        return;
      }
      // Validate at least one variant has inventory if tracking
      const hasInventory = variants.some((v) => !v.trackInventory || v.inventoryQuantity > 0);
      if (!hasInventory) {
        setError('At least one variant must have inventory');
        return;
      }
    } else {
      // Single product validation
      if (!formData.price || formData.price <= 0) {
        setError('A valid price is required');
        return;
      }
    }

    // Additional validation for ACTIVE products
    if (formData.status === ProductStatus.ACTIVE) {
      if (!formData.images || formData.images.length === 0) {
        setError('At least one product image is required to publish as Active');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Convert image URLs to the format expected by the API
      const images = (formData.images || []).map((url, index) => ({
        url: typeof url === 'string' ? url : url.url,
        altText: formData.title,
        isPrimary: index === 0,
      }));

      const productData = {
        ...formData,
        images,
        hasVariants,
        variantOptions: hasVariants ? variantOptions : null,
        variants: hasVariants ? variants : [],
      } as CreateProductInput;

      let result;

      if (isEditing && productId) {
        // Update existing product
        result = await updateProduct(productId, productData);
      } else {
        // Create new product
        result = await createProduct(productData);
      }

      if (result.success) {
        router.push('/seller/products');
        router.refresh();
      } else {
        setError(result.error || `Failed to ${isEditing ? 'update' : 'create'} product`);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    field: keyof CreateProductInput,
    value: string | number | boolean | string[] | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEcoProfileChange = (ecoProfile: Partial<ProductEcoProfileData>) => {
    setFormData((prev) => ({ ...prev, ecoProfile }));
  };

  const handleVariantChange = useCallback(
    (options: VariantOptionsData, variantList: VariantInput[]) => {
      setVariantOptions(options);
      setVariants(variantList);
    },
    []
  );

  const handleVariantToggle = (enabled: boolean) => {
    setHasVariants(enabled);
    if (!enabled) {
      // Clear variant data when disabling
      setVariantOptions(null);
      setVariants([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-card space-y-4 rounded-lg border p-6">
        <h2 className="text-xl font-bold">Basic Information</h2>

        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            Product Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Organic Cotton Tote Bag"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe your product, its features, and sustainability benefits..."
            required
            rows={4}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Category Selection - Cascading Dropdowns */}
        <CascadingCategorySelect
          categories={categories}
          value={formData.categoryId}
          onChange={(categoryId) => handleChange('categoryId', categoryId || '')}
          disabled={isSubmitting}
          required
        />

        {/* SKU */}
        <div>
          <label htmlFor="sku" className="mb-2 block text-sm font-medium">
            SKU (optional)
          </label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="e.g., TOTE-ORG-001"
          />
        </div>
      </div>

      {/* Product Images */}
      <div className="bg-card space-y-4 rounded-lg border p-6">
        <h2 className="text-xl font-bold">Product Images</h2>
        <p className="text-muted-foreground text-sm">
          Upload up to 10 images. The first image will be used as the primary product image.
        </p>
        <ImageUpload
          value={(formData.images || []) as unknown as string[]}
          onChange={(urls) => handleChange('images', urls as unknown as string[])}
          maxImages={10}
          disabled={isSubmitting}
        />
      </div>

      {/* Variant Toggle */}
      <div className="bg-card space-y-4 rounded-lg border p-6">
        <div>
          <h2 className="mb-2 text-xl font-bold">Product Options</h2>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => handleVariantToggle(e.target.checked)}
              className="text-forest-dark focus:ring-forest-dark mt-1 size-4 rounded border-gray-300"
            />
            <div className="flex-1">
              <span className="text-sm font-medium">This product has variants</span>
              <p className="text-muted-foreground mt-1 text-xs">
                Add options like size or color that buyers can choose from (e.g.,
                Small/Medium/Large)
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Pricing - shown only if NOT using variants */}
      {!hasVariants && (
        <div className="bg-card space-y-4 rounded-lg border p-6">
          <h2 className="text-xl font-bold">Pricing</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="price" className="mb-2 block text-sm font-medium">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={(e) =>
                  handleChange('price', e.target.value ? parseFloat(e.target.value) : 0)
                }
                placeholder="24.99"
                required
              />
            </div>

            <div>
              <label htmlFor="compareAtPrice" className="mb-2 block text-sm font-medium">
                Compare at Price (optional)
              </label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.compareAtPrice || ''}
                onChange={(e) =>
                  handleChange(
                    'compareAtPrice',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="34.99"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Show original price for discounts
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Variant Manager - shown only if using variants */}
      {hasVariants && (
        <div className="bg-card space-y-4 rounded-lg border p-6">
          <h2 className="text-xl font-bold">Variant Manager</h2>
          <p className="text-muted-foreground text-sm">
            Define your variant options (like Size and Color), then generate all combinations. Each
            variant has its own pricing and inventory.
          </p>
          <VariantManager
            productPrice={formData.price || 0}
            productImages={(formData.images || []).map((img) => ({
              url: typeof img === 'string' ? img : img.url,
              altText: formData.title,
            }))}
            initialOptions={variantOptions || undefined}
            initialVariants={variants}
            onChange={handleVariantChange}
          />
        </div>
      )}

      {/* Inventory Management - shown only if NOT using variants */}
      {!hasVariants && (
        <div className="bg-card space-y-4 rounded-lg border p-6">
          <h2 className="text-xl font-bold">Inventory</h2>

          <div>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={formData.trackInventory ?? true}
                onChange={(e) => handleChange('trackInventory', e.target.checked)}
                className="text-forest-dark focus:ring-forest-dark size-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium">Track inventory for this product</span>
            </label>
            <p className="text-muted-foreground mt-1 ml-7 text-xs">
              Evercraft will track stock levels and show &quot;Out of Stock&quot; when quantity
              reaches zero
            </p>
          </div>

          {(formData.trackInventory ?? true) && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="inventoryQuantity" className="mb-2 block text-sm font-medium">
                  Quantity in Stock <span className="text-red-500">*</span>
                </label>
                <Input
                  id="inventoryQuantity"
                  type="number"
                  min="0"
                  value={formData.inventoryQuantity ?? 0}
                  onChange={(e) =>
                    handleChange('inventoryQuantity', e.target.value ? parseInt(e.target.value) : 0)
                  }
                  placeholder="100"
                  required
                />
              </div>

              <div>
                <label htmlFor="lowStockThreshold" className="mb-2 block text-sm font-medium">
                  Low Stock Alert (optional)
                </label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold ?? ''}
                  onChange={(e) =>
                    handleChange(
                      'lowStockThreshold',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="10"
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Get notified when stock falls below this number
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shop Sections */}
      {sections.length > 0 && (
        <div className="bg-card space-y-4 rounded-lg border p-6">
          <div>
            <h2 className="text-xl font-bold">Shop Sections</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Organize this product into sections (optional)
            </p>
          </div>

          <div className="space-y-2">
            {sections.map((section) => (
              <label
                key={section.id}
                className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition"
              >
                <input
                  type="checkbox"
                  checked={(formData.sectionIds || []).includes(section.id)}
                  onChange={(e) => {
                    const currentSections = formData.sectionIds || [];
                    if (e.target.checked) {
                      handleChange('sectionIds', [...currentSections, section.id]);
                    } else {
                      handleChange(
                        'sectionIds',
                        currentSections.filter((id) => id !== section.id)
                      );
                    }
                  }}
                  className="size-4 rounded border-gray-300"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{section.name}</span>
                    {!section.isVisible && (
                      <span className="text-muted-foreground text-xs">(hidden)</span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {section._count.products}{' '}
                    {section._count.products === 1 ? 'product' : 'products'}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {sections.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No sections yet. Create sections from the{' '}
              <Link href="/seller/sections" className="text-forest underline">
                Sections page
              </Link>
              .
            </p>
          )}
        </div>
      )}

      {/* Product Eco-Profile */}
      <ProductEcoProfileForm value={formData.ecoProfile || {}} onChange={handleEcoProfileChange} />

      {/* Publish Status */}
      <div className="bg-card space-y-4 rounded-lg border p-6">
        <h2 className="text-xl font-bold">Publish Status</h2>
        <p className="text-muted-foreground text-sm">
          Choose whether to save this product as a draft or publish it immediately.
        </p>

        <div className="space-y-3">
          {/* Draft Option */}
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors ${
              formData.status === ProductStatus.DRAFT
                ? 'border-eco-dark bg-eco-light/10'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <input
              type="radio"
              name="status"
              value={ProductStatus.DRAFT}
              checked={formData.status === ProductStatus.DRAFT}
              onChange={(e) => handleChange('status', e.target.value)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <EyeOff className="size-4" />
                <span className="font-semibold">Save as Draft</span>
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                  Hidden
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Product will be saved but not visible to customers. You can continue editing and
                publish later.
              </p>
            </div>
          </label>

          {/* Active Option */}
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors ${
              formData.status === ProductStatus.ACTIVE
                ? 'border-eco-dark bg-eco-light/10'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <input
              type="radio"
              name="status"
              value={ProductStatus.ACTIVE}
              checked={formData.status === ProductStatus.ACTIVE}
              onChange={(e) => handleChange('status', e.target.value)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Eye className="size-4" />
                <span className="font-semibold">Publish as Active</span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  Public
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Product will be immediately visible and purchasable by customers on the browse page.
              </p>
              {formData.status === ProductStatus.ACTIVE && (
                <div className="bg-eco-light/20 border-eco-dark/20 mt-2 flex gap-2 rounded border p-2 text-xs">
                  <Info className="text-eco-dark mt-0.5 size-3 flex-shrink-0" />
                  <span className="text-eco-dark">
                    <strong>Required:</strong> At least one image and a valid price must be set to
                    publish as Active.
                  </span>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" asChild>
          <Link href="/seller/products">
            <ArrowLeft className="mr-2 size-4" />
            Cancel
          </Link>
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              {isEditing ? 'Update Product' : 'Create Product'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
