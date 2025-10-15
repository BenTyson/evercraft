'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createSection, updateSection } from '@/actions/shop-sections';

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

interface SectionFormDialogProps {
  shopId: string;
  section?: Section;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (section?: Section) => void;
}

export function SectionFormDialog({
  shopId,
  section,
  open,
  onOpenChange,
  onSuccess,
}: SectionFormDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!section;

  // Load section data when editing
  useEffect(() => {
    if (section) {
      setName(section.name);
      setDescription(section.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setError('');
  }, [section, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Section name is required');
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        const result = await updateSection(section.id, {
          name: name.trim(),
          description: description.trim() || undefined,
        });

        if (result.success && result.section) {
          onSuccess({
            ...result.section,
            _count: { products: section._count.products },
          } as Section);
        } else {
          setError(result.error || 'Failed to update section');
        }
      } else {
        const result = await createSection(shopId, {
          name: name.trim(),
          description: description.trim() || undefined,
        });

        if (result.success && result.section) {
          onSuccess({
            ...result.section,
            _count: { products: 0 },
          } as Section);
        } else {
          setError(result.error || 'Failed to create section');
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Section' : 'Create Section'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the section details below'
                : 'Create a new section to organize your products'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Section Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Bestsellers, Spring Collection"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <p className="text-muted-foreground text-xs">
                This will be displayed on your shop page
              </p>
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe this section..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            {/* Slug Preview */}
            {name && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs font-medium">URL Slug Preview:</p>
                <p className="text-muted-foreground mt-1 font-mono text-xs">
                  {name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
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
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update Section'
                  : 'Create Section'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
