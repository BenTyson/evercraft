'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormField } from '@/components/forms/form-field';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { validateForm, hasErrors, ValidationSchema } from '@/lib/validation';
import { createSection, updateSection } from '@/actions/shop-sections';

interface FormData {
  name: string;
  description: string;
}

const validationSchema: ValidationSchema<FormData> = {
  name: {
    required: 'Section name is required',
    minLength: { value: 1, message: 'Section name cannot be empty' },
  },
};

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
  const isEditing = !!section;

  const { isSubmitting, error, handleSubmit } = useFormSubmission({
    onSuccess: () => {
      // onSuccess will be called in the submit handler with the section data
    },
  });

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Load section data when editing
  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name,
        description: section.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
    setFieldErrors({});
  }, [section, open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm(formData, validationSchema);
    setFieldErrors(errors);

    if (hasErrors(errors)) {
      return;
    }

    // Submit form
    await handleSubmit(async () => {
      let result;

      if (isEditing) {
        result = await updateSection(section.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
      } else {
        result = await createSection(shopId, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save section');
      }

      // Call parent's onSuccess with the section data
      if (result.section) {
        onSuccess({
          ...result.section,
          _count: { products: isEditing ? section._count.products : 0 },
        } as Section);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
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
            <FormField
              label="Section Name"
              name="name"
              required
              error={fieldErrors.name}
              description="This will be displayed on your shop page"
            >
              <Input
                id="name"
                placeholder="e.g., Bestsellers, Spring Collection"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setFieldErrors({ ...fieldErrors, name: undefined });
                }}
                disabled={isSubmitting}
                autoFocus
                aria-invalid={!!fieldErrors.name}
              />
            </FormField>

            {/* Description Input */}
            <FormField label="Description" name="description">
              <Textarea
                id="description"
                placeholder="Describe this section..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
                rows={3}
              />
            </FormField>

            {/* Slug Preview */}
            {formData.name && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs font-medium">URL Slug Preview:</p>
                <p className="text-muted-foreground mt-1 font-mono text-xs">
                  {formData.name
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
              {isSubmitting
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
