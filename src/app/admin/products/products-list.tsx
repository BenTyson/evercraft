'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, XCircle, Archive, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateProductStatus, deleteProduct } from '@/actions/admin-products';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  createdAt: Date;
  shop: {
    name: string;
    user: {
      name: string | null;
      email: string | null;
    };
  };
  images: Array<{
    url: string;
    altText: string | null;
  }>;
  category: {
    name: string;
  } | null;
  _count: {
    reviews: number;
  };
}

interface ProductsListProps {
  products: Product[];
}

export function ProductsList({ products: initialProducts }: ProductsListProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredProducts =
    filter === 'ALL' ? products : products.filter((p) => p.status === filter);

  const handleStatusChange = async (
    productId: string,
    status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  ) => {
    setProcessingId(productId);
    const result = await updateProductStatus(productId, status);

    if (result.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status } : p))
      );
      router.refresh();
    } else {
      alert(result.error || 'Failed to update product status');
    }

    setProcessingId(null);
  };

  const handleDelete = async (productId: string, productTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${productTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setProcessingId(productId);
    const result = await deleteProduct(productId);

    if (result.success) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete product');
    }

    setProcessingId(null);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      ARCHIVED: 'bg-red-100 text-red-800',
      SOLD_OUT: 'bg-yellow-100 text-yellow-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2">
        <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')}>
          All ({products.length})
        </FilterButton>
        <FilterButton
          active={filter === 'ACTIVE'}
          onClick={() => setFilter('ACTIVE')}
        >
          Active ({products.filter((p) => p.status === 'ACTIVE').length})
        </FilterButton>
        <FilterButton
          active={filter === 'DRAFT'}
          onClick={() => setFilter('DRAFT')}
        >
          Draft ({products.filter((p) => p.status === 'DRAFT').length})
        </FilterButton>
        <FilterButton
          active={filter === 'ARCHIVED'}
          onClick={() => setFilter('ARCHIVED')}
        >
          Archived ({products.filter((p) => p.status === 'ARCHIVED').length})
        </FilterButton>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex gap-6">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].altText || product.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold">{product.title}</h3>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(product.status)}`}
                        >
                          {product.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {product.shop.name} • {product.shop.user.name || product.shop.user.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.category?.name} • ${product.price.toFixed(2)}
                      </p>
                    </div>

                    <Link
                      href={`/products/${product.id}`}
                      target="_blank"
                      className="text-[#2D6A4F] hover:text-[#1B4332]"
                    >
                      <ExternalLink className="size-5" />
                    </Link>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{product._count.reviews} reviews</span>
                    <span>•</span>
                    <span>
                      Listed {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    {product.status !== 'ACTIVE' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStatusChange(product.id, 'ACTIVE')}
                        disabled={processingId === product.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingId === product.id ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 size-4" />
                        )}
                        Publish
                      </Button>
                    )}

                    {product.status !== 'DRAFT' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(product.id, 'DRAFT')}
                        disabled={processingId === product.id}
                      >
                        {processingId === product.id ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 size-4" />
                        )}
                        Unpublish
                      </Button>
                    )}

                    {product.status !== 'ARCHIVED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(product.id, 'ARCHIVED')}
                        disabled={processingId === product.id}
                      >
                        {processingId === product.id ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Archive className="mr-2 size-4" />
                        )}
                        Archive
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id, product.title)}
                      disabled={processingId === product.id}
                    >
                      {processingId === product.id ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 size-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No products found
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-[#2D6A4F] text-white hover:bg-[#1B4332]'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}
