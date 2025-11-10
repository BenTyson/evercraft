/**
 * Admin Categories Management Page
 *
 * Full CRUD interface for managing category hierarchy.
 * Features: Create, edit, delete categories, view statistics.
 */

import { Metadata } from 'next';
import { FolderTree } from 'lucide-react';
import { getAllCategoriesHierarchy, getCategoryStats } from '@/actions/admin-categories';
import { CategoryTreeView } from './category-tree-view';
import { CreateCategoryButton } from './create-category-button';

export const metadata: Metadata = {
  title: 'Manage Categories | Admin',
  description: 'Manage product categories and subcategories',
};

export default async function AdminCategoriesPage() {
  const [categoriesResult, statsResult] = await Promise.all([
    getAllCategoriesHierarchy(),
    getCategoryStats(),
  ]);

  if (!categoriesResult.success || !categoriesResult.categories) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Categories</h1>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            Error loading categories: {categoriesResult.error}
          </div>
        </div>
      </div>
    );
  }

  const categories = categoriesResult.categories;
  const stats = statsResult.success ? statsResult.stats : null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">Manage your product category hierarchy</p>
        </div>
        <CreateCategoryButton />
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-2">
              <FolderTree className="text-muted-foreground size-4" />
              <p className="text-muted-foreground text-sm font-medium">Top-Level</p>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.topLevelCount}</p>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-2">
              <FolderTree className="text-muted-foreground size-4" />
              <p className="text-muted-foreground text-sm font-medium">Subcategories</p>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.subcategoryCount}</p>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-2">
              <FolderTree className="text-muted-foreground size-4" />
              <p className="text-muted-foreground text-sm font-medium">Total Categories</p>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.totalCategories}</p>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-2">
              <FolderTree className="text-muted-foreground size-4" />
              <p className="text-muted-foreground text-sm font-medium">Total Products</p>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.totalProducts}</p>
          </div>
        </div>
      )}

      {/* Category Tree */}
      <div className="rounded-lg border bg-white">
        <div className="border-b p-4">
          <h2 className="font-semibold">Category Hierarchy</h2>
          <p className="text-muted-foreground text-sm">
            Organize your categories and subcategories
          </p>
        </div>
        <div className="p-4">
          {categories.length > 0 ? (
            <CategoryTreeView categories={categories} />
          ) : (
            <div className="py-12 text-center">
              <FolderTree className="text-muted-foreground mx-auto mb-4 size-12" />
              <h3 className="mb-2 text-lg font-semibold">No Categories Yet</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Create your first category to get started
              </p>
              <CreateCategoryButton variant="default" />
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
