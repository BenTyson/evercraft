'use client';

import { useState } from 'react';
import { Pencil, Trash2, Eye, EyeOff, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { updateSection, deleteSection, reorderSections } from '@/actions/shop-sections';
import { SectionFormDialog } from './section-form-dialog';
import { SectionProductAssignment } from './section-product-assignment';
import { useRouter } from 'next/navigation';

interface Section {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  isVisible: boolean;
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

interface SectionManagerProps {
  shopId: string;
  initialSections: Section[];
  availableProducts: Product[];
}

export function SectionManager({
  shopId,
  initialSections,
  availableProducts,
}: SectionManagerProps) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [assigningSection, setAssigningSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleVisibility = async (section: Section) => {
    setLoading(section.id);
    const result = await updateSection(section.id, {
      isVisible: !section.isVisible,
    });

    if (result.success) {
      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, isVisible: !s.isVisible } : s))
      );
      router.refresh();
    }
    setLoading(null);
  };

  const handleDelete = async (section: Section) => {
    if (
      !confirm(
        `Are you sure you want to delete "${section.name}"?\n\n${section._count.products} product(s) will be removed from this section (but won't be deleted).`
      )
    ) {
      return;
    }

    setLoading(section.id);
    const result = await deleteSection(section.id);

    if (result.success) {
      setSections((prev) => prev.filter((s) => s.id !== section.id));
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete section');
    }
    setLoading(null);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];

    // Update positions
    const updates = newSections.map((section, i) => ({
      id: section.id,
      position: i,
    }));

    setSections(newSections);

    await reorderSections(shopId, updates);
    router.refresh();
  };

  const handleMoveDown = async (index: number) => {
    if (index === sections.length - 1) return;

    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];

    // Update positions
    const updates = newSections.map((section, i) => ({
      id: section.id,
      position: i,
    }));

    setSections(newSections);

    await reorderSections(shopId, updates);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {sections.length} {sections.length === 1 ? 'Section' : 'Sections'}
          </h2>
          <p className="text-muted-foreground text-sm">
            Sections help organize your shop for easier browsing
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Create Section
        </Button>
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="bg-muted rounded-lg p-12 text-center">
          <Package className="text-muted-foreground mx-auto mb-4 size-12" />
          <h3 className="mb-2 text-lg font-semibold">No sections yet</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Create your first section to start organizing your products
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create Section
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="bg-card flex items-center justify-between rounded-lg border p-4"
            >
              {/* Section Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{section.name}</h3>
                  <Badge variant="secondary">
                    {section._count.products}{' '}
                    {section._count.products === 1 ? 'product' : 'products'}
                  </Badge>
                  {!section.isVisible && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Hidden
                    </Badge>
                  )}
                </div>
                {section.description && (
                  <p className="text-muted-foreground mt-1 text-sm">{section.description}</p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">Slug: {section.slug}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="h-6 px-2"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sections.length - 1}
                    className="h-6 px-2"
                  >
                    ↓
                  </Button>
                </div>

                {/* Visibility Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleVisibility(section)}
                  disabled={loading === section.id}
                >
                  {section.isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </Button>

                {/* Assign Products */}
                <Button variant="ghost" size="sm" onClick={() => setAssigningSection(section)}>
                  <Package className="size-4" />
                </Button>

                {/* Edit */}
                <Button variant="ghost" size="sm" onClick={() => setEditingSection(section)}>
                  <Pencil className="size-4" />
                </Button>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(section)}
                  disabled={loading === section.id}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <SectionFormDialog
        shopId={shopId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={(newSection) => {
          if (newSection) {
            // Add new section to local state immediately
            setSections((prev) => [...prev, newSection]);
          }
          router.refresh();
          setIsCreateOpen(false);
        }}
      />

      {/* Edit Dialog */}
      {editingSection && (
        <SectionFormDialog
          shopId={shopId}
          section={editingSection}
          open={!!editingSection}
          onOpenChange={(open) => !open && setEditingSection(null)}
          onSuccess={(updatedSection) => {
            if (updatedSection) {
              // Update section in local state immediately
              setSections((prev) =>
                prev.map((s) => (s.id === updatedSection.id ? { ...s, ...updatedSection } : s))
              );
            }
            router.refresh();
            setEditingSection(null);
          }}
        />
      )}

      {/* Product Assignment Dialog */}
      {assigningSection && (
        <SectionProductAssignment
          section={assigningSection}
          availableProducts={availableProducts}
          open={!!assigningSection}
          onOpenChange={(open) => !open && setAssigningSection(null)}
          onSuccess={() => {
            router.refresh();
            setAssigningSection(null);
          }}
        />
      )}
    </div>
  );
}
