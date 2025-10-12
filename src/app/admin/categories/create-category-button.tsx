/**
 * Create Category Button
 *
 * Button that opens the category creation dialog.
 */

'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryFormDialog } from './category-form-dialog';

interface CreateCategoryButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
}

export function CreateCategoryButton({ variant = 'default' }: CreateCategoryButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant={variant}>
        <Plus className="mr-2 size-4" />
        Create Category
      </Button>

      <CategoryFormDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
