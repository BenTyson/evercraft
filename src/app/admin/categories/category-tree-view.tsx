/**
 * Category Tree View Component
 *
 * Displays categories in a hierarchical tree structure
 * with expand/collapse and action buttons.
 */

'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Edit, Trash2, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryFormDialog } from './category-form-dialog';
import { DeleteCategoryDialog } from './delete-category-dialog';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
  position: number;
  children: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    productCount: number;
    position: number;
    parentId: string | null;
  }>;
}

interface CategoryTreeViewProps {
  categories: Category[];
}

export function CategoryTreeView({ categories }: CategoryTreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId?: string;
  } | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<{
    id: string;
    name: string;
    productCount: number;
    childCount: number;
  } | null>(null);
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-1">
      {categories.map((category) => (
        <div key={category.id}>
          {/* Parent Category Row */}
          <div className="flex items-center gap-2 rounded-md p-2 hover:bg-neutral-50">
            {/* Expand/Collapse Button */}
            <button
              onClick={() => toggleExpanded(category.id)}
              className="text-muted-foreground hover:text-foreground p-1"
              type="button"
            >
              {category.children.length > 0 ? (
                expandedIds.has(category.id) ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )
              ) : (
                <div className="size-4" />
              )}
            </button>

            {/* Category Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                  {category.children.length} subcategories
                </span>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Package className="size-3" />
                  {category.productCount}
                </span>
              </div>
              {category.description && (
                <p className="text-muted-foreground text-xs">{category.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddingSubcategoryTo(category.id)}
                type="button"
              >
                <Plus className="mr-1 size-3" />
                Add Subcategory
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setEditingCategory({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                  })
                }
                type="button"
              >
                <Edit className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDeletingCategory({
                    id: category.id,
                    name: category.name,
                    productCount: category.productCount,
                    childCount: category.children.length,
                  })
                }
                type="button"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>

          {/* Subcategories */}
          {expandedIds.has(category.id) && category.children.length > 0 && (
            <div className="ml-6 space-y-1 border-l-2 border-neutral-100 pl-4">
              {category.children.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-neutral-50"
                >
                  <div className="size-4" />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{subcategory.name}</span>
                      <span className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Package className="size-3" />
                        {subcategory.productCount}
                      </span>
                    </div>
                    {subcategory.description && (
                      <p className="text-muted-foreground text-xs">{subcategory.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditingCategory({
                          id: subcategory.id,
                          name: subcategory.name,
                          slug: subcategory.slug,
                          description: subcategory.description,
                          parentId: category.id,
                        })
                      }
                      type="button"
                    >
                      <Edit className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDeletingCategory({
                          id: subcategory.id,
                          name: subcategory.name,
                          productCount: subcategory.productCount,
                          childCount: 0,
                        })
                      }
                      type="button"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Edit Dialog */}
      {editingCategory && (
        <CategoryFormDialog
          open={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          category={editingCategory}
          parentCategories={categories}
        />
      )}

      {/* Add Subcategory Dialog */}
      {addingSubcategoryTo && (
        <CategoryFormDialog
          open={!!addingSubcategoryTo}
          onClose={() => setAddingSubcategoryTo(null)}
          parentId={addingSubcategoryTo}
          parentCategories={categories}
        />
      )}

      {/* Delete Dialog */}
      {deletingCategory && (
        <DeleteCategoryDialog
          open={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          category={deletingCategory}
        />
      )}
    </div>
  );
}
