import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string | null;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * FormField Component
 *
 * Wrapper for form fields with consistent styling and error handling
 *
 * Features:
 * - Label with optional required indicator
 * - Optional description text
 * - Error message display
 * - Consistent spacing and layout
 *
 * @example
 * ```tsx
 * import { Input } from '@/components/ui/input';
 *
 * <FormField label="Email" name="email" required error={errors.email}>
 *   <Input
 *     type="email"
 *     value={formData.email}
 *     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 *   />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  name,
  required = false,
  error,
  description,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {description && <p className="text-muted-foreground text-xs">{description}</p>}

      {children}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
