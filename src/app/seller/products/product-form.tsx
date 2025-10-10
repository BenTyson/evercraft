/**
 * Product Form Component
 *
 * Client component for creating/editing products with validation.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/image-upload';
import {
  createProduct,
  updateProduct,
  type CreateProductInput,
} from '@/actions/seller-products';

interface ProductFormProps {
  shopId: string;
  categories: Array<{ id: string; name: string; description: string | null; count: number }>;
  certifications: Array<{ id: string; name: string; count: number }>;
  initialData?: Partial<CreateProductInput>;
  productId?: string;
  isEditing?: boolean;
}

export function ProductForm({
  shopId,
  categories,
  certifications,
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
    ecoAttributes: initialData?.ecoAttributes || {},
    images: initialData?.images || [],
    inventoryQuantity: initialData?.inventoryQuantity ?? 0,
    trackInventory: initialData?.trackInventory ?? true,
    lowStockThreshold: initialData?.lowStockThreshold,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title || !formData.description || !formData.price || !formData.categoryId) {
      setError('Please fill in all required fields');
      return;
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

  const handleEcoAttributeChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ecoAttributes: {
        ...prev.ecoAttributes,
        [field]: value,
      },
    }));
  };

  const toggleCertification = (certId: string) => {
    setFormData((prev) => {
      const current = prev.certificationIds || [];
      const updated = current.includes(certId)
        ? current.filter((id) => id !== certId)
        : [...current, certId];
      return { ...prev, certificationIds: updated };
    });
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
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              required
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

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
      </div>

      {/* Product Images */}
      <div className="bg-card space-y-4 rounded-lg border p-6">
        <h2 className="text-xl font-bold">Product Images</h2>
        <p className="text-muted-foreground text-sm">
          Upload up to 4 images. The first image will be used as the primary product image.
        </p>
        <ImageUpload
          value={(formData.images || []) as unknown as string[]}
          onChange={(urls) => handleChange('images', urls as unknown as string[])}
          disabled={isSubmitting}
        />
      </div>

      {/* Pricing */}
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

      {/* Inventory Management */}
      <div className="bg-card space-y-4 rounded-lg border p-6">
        <h2 className="text-xl font-bold">Inventory</h2>

        <div>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.trackInventory ?? true}
              onChange={(e) => handleChange('trackInventory', e.target.checked)}
              className="size-4 rounded border-gray-300 text-forest-dark focus:ring-forest-dark"
            />
            <span className="text-sm font-medium">Track inventory for this product</span>
          </label>
          <p className="text-muted-foreground ml-7 mt-1 text-xs">
            Evercraft will track stock levels and show &quot;Out of Stock&quot; when quantity reaches zero
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
                  handleChange(
                    'inventoryQuantity',
                    e.target.value ? parseInt(e.target.value) : 0
                  )
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

      {/* Sustainability Details */}
      <div className="bg-card space-y-4 rounded-lg border p-6">
        <h2 className="text-xl font-bold">Sustainability Details</h2>

        <div>
          <label className="mb-3 block text-sm font-medium">Certifications</label>
          <div className="grid gap-3 md:grid-cols-2">
            {certifications.map((cert) => (
              <label
                key={cert.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={formData.certificationIds?.includes(cert.id)}
                  onChange={() => toggleCertification(cert.id)}
                  className="size-4 rounded border-gray-300 text-forest-dark focus:ring-forest-dark"
                />
                <span className="text-sm font-medium">{cert.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="material" className="mb-2 block text-sm font-medium">
              Material
            </label>
            <Input
              id="material"
              value={formData.ecoAttributes?.material || ''}
              onChange={(e) => handleEcoAttributeChange('material', e.target.value)}
              placeholder="e.g., 100% Organic Cotton"
            />
          </div>

          <div>
            <label htmlFor="packaging" className="mb-2 block text-sm font-medium">
              Packaging
            </label>
            <Input
              id="packaging"
              value={formData.ecoAttributes?.packaging || ''}
              onChange={(e) => handleEcoAttributeChange('packaging', e.target.value)}
              placeholder="e.g., Compostable"
            />
          </div>

          <div>
            <label htmlFor="carbonFootprint" className="mb-2 block text-sm font-medium">
              Carbon Footprint
            </label>
            <Input
              id="carbonFootprint"
              value={formData.ecoAttributes?.carbonFootprint || ''}
              onChange={(e) => handleEcoAttributeChange('carbonFootprint', e.target.value)}
              placeholder="e.g., Carbon neutral shipping"
            />
          </div>

          <div>
            <label htmlFor="madeIn" className="mb-2 block text-sm font-medium">
              Made In
            </label>
            <Input
              id="madeIn"
              value={formData.ecoAttributes?.madeIn || ''}
              onChange={(e) => handleEcoAttributeChange('madeIn', e.target.value)}
              placeholder="e.g., USA"
            />
          </div>
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
