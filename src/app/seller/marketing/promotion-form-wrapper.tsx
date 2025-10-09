'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PromotionForm from './promotion-form';

export default function PromotionFormWrapper() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Button onClick={() => setShowForm(true)}>
        <Plus className="mr-2 size-5" />
        Create Promotion
      </Button>

      {showForm && <PromotionForm onClose={() => setShowForm(false)} />}
    </>
  );
}
