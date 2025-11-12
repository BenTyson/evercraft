'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  addProductsToSection,
  removeProductFromSection,
  getSectionWithProducts,
} from '@/actions/shop-sections';
import { Search } from 'lucide-react';
import Image from 'next/image';

interface Section {
  id: string;
  name: string;
  _count: {
    products: number;
  };
}

interface Product {
  id: string;
  title: string;
  price: number;
  images: { url: string }[];
}

interface SectionProductAssignmentProps {
  section: Section;
  availableProducts: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SectionProductAssignment({
  section,
  availableProducts,
  open,
  onOpenChange,
  onSuccess,
}: SectionProductAssignmentProps) {
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [currentProducts, setCurrentProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Load current products in section
  const loadCurrentProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const result = await getSectionWithProducts(section.id);
      if (result.success && result.section) {
        const productIds = new Set(
          result.section.products.map((p: { productId: string }) => p.productId)
        );
        setCurrentProducts(productIds);
        setSelectedProducts(productIds);
      }
    } catch (error) {
      console.error('Failed to load section products:', error);
    } finally {
      setLoadingProducts(false);
    }
  }, [section.id]);

  useEffect(() => {
    if (open) {
      loadCurrentProducts();
      setSearch('');
    }
  }, [open, loadCurrentProducts]);

  const filteredProducts = availableProducts.filter((product) =>
    product.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      // Determine products to add and remove
      const toAdd = Array.from(selectedProducts).filter((id) => !currentProducts.has(id));
      const toRemove = Array.from(currentProducts).filter((id) => !selectedProducts.has(id));

      // Execute additions and removals
      const promises: Promise<unknown>[] = [];

      if (toAdd.length > 0) {
        promises.push(addProductsToSection(section.id, toAdd));
      }

      for (const productId of toRemove) {
        promises.push(removeProductFromSection(section.id, productId));
      }

      await Promise.all(promises);

      onSuccess();
    } catch (error) {
      console.error('Failed to update section products:', error);
      alert('Failed to update products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges =
    selectedProducts.size !== currentProducts.size ||
    Array.from(selectedProducts).some((id) => !currentProducts.has(id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Products - {section.name}</DialogTitle>
          <DialogDescription>Select which products should appear in this section</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Product List */}
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {loadingProducts ? (
              <div className="text-muted-foreground py-8 text-center">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                {search ? 'No products match your search' : 'No products available'}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <label
                  key={product.id}
                  className="bg-card flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onChange={() => handleToggleProduct(product.id)}
                  />
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.title}
                      width={48}
                      height={48}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="bg-muted flex size-12 items-center justify-center rounded">
                      <span className="text-muted-foreground text-xs">No image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{product.title}</p>
                    <p className="text-muted-foreground text-sm">${product.price.toFixed(2)}</p>
                  </div>
                </label>
              ))
            )}
          </div>

          {/* Selection Summary */}
          <div className="bg-muted rounded-lg p-3 text-sm">
            <strong>{selectedProducts.size}</strong> product
            {selectedProducts.size !== 1 ? 's' : ''} selected
            {hasChanges && <span className="text-muted-foreground ml-2">(unsaved changes)</span>}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !hasChanges}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
