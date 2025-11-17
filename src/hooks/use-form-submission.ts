import { useState, useCallback } from 'react';

interface UseFormSubmissionOptions {
  onSuccess?: () => void;
  successMessage?: string;
}

interface UseFormSubmissionReturn<T> {
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
  handleSubmit: (submitFn: () => Promise<T>) => Promise<T | undefined>;
  resetState: () => void;
  setError: (error: string | null) => void;
}

/**
 * Hook for managing form submission state
 *
 * Handles common form submission patterns:
 * - Loading state management
 * - Error handling and display
 * - Success messages
 * - Automatic state cleanup
 *
 * @example
 * ```tsx
 * const { isSubmitting, error, success, handleSubmit } = useFormSubmission({
 *   onSuccess: () => router.push('/dashboard'),
 *   successMessage: 'Profile updated successfully'
 * });
 *
 * const onSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault();
 *   await handleSubmit(async () => {
 *     await updateProfile(formData);
 *   });
 * };
 * ```
 */
export function useFormSubmission<T = void>(
  options: UseFormSubmissionOptions = {}
): UseFormSubmissionReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleSubmit = useCallback(
    async (submitFn: () => Promise<T>): Promise<T | undefined> => {
      // Reset previous states
      setError(null);
      setSuccess(null);
      setIsSubmitting(true);

      try {
        const result = await submitFn();

        // Set success message if provided
        if (options.successMessage) {
          setSuccess(options.successMessage);
        }

        // Call success callback if provided
        if (options.onSuccess) {
          options.onSuccess();
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        return undefined;
      } finally {
        setIsSubmitting(false);
      }
    },
    [options]
  );

  return {
    isSubmitting,
    error,
    success,
    handleSubmit,
    resetState,
    setError,
  };
}
