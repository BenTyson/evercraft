import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * FormSection Component
 *
 * Groups related form fields with consistent spacing and optional header
 *
 * Features:
 * - Section title
 * - Optional description
 * - Consistent spacing between fields
 * - Visual separation from other sections
 *
 * @example
 * ```tsx
 * <FormSection
 *   title="Shop Profile"
 *   description="Basic information about your shop"
 * >
 *   <FormField label="Shop Name" name="name">
 *     <Input value={formData.name} onChange={handleChange} />
 *   </FormField>
 *   <FormField label="Description" name="description">
 *     <Textarea value={formData.description} onChange={handleChange} />
 *   </FormField>
 * </FormSection>
 * ```
 */
export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
