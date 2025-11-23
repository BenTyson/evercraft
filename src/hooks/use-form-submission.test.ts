import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormSubmission } from './use-form-submission';

describe('useFormSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with isSubmitting false', () => {
      const { result } = renderHook(() => useFormSubmission());
      expect(result.current.isSubmitting).toBe(false);
    });

    it('starts with no error', () => {
      const { result } = renderHook(() => useFormSubmission());
      expect(result.current.error).toBeNull();
    });

    it('starts with no success message', () => {
      const { result } = renderHook(() => useFormSubmission());
      expect(result.current.success).toBeNull();
    });
  });

  describe('handleSubmit - success path', () => {
    it('sets isSubmitting to true during submission', async () => {
      const { result } = renderHook(() => useFormSubmission());

      let resolvePromise: () => void;
      const submitFn = () =>
        new Promise<void>((resolve) => {
          resolvePromise = resolve;
        });

      act(() => {
        result.current.handleSubmit(submitFn);
      });

      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        resolvePromise!();
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('returns result from submit function', async () => {
      const { result } = renderHook(() => useFormSubmission<{ id: string }>());

      const expectedResult = { id: 'test-123' };
      const submitFn = () => Promise.resolve(expectedResult);

      let returnedResult: { id: string } | undefined;
      await act(async () => {
        returnedResult = await result.current.handleSubmit(submitFn);
      });

      expect(returnedResult).toEqual(expectedResult);
    });

    it('sets success message when provided in options', async () => {
      const { result } = renderHook(() =>
        useFormSubmission({
          successMessage: 'Form submitted successfully!',
        })
      );

      const submitFn = () => Promise.resolve();

      await act(async () => {
        await result.current.handleSubmit(submitFn);
      });

      expect(result.current.success).toBe('Form submitted successfully!');
    });

    it('calls onSuccess callback when provided', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useFormSubmission({
          onSuccess,
        })
      );

      const submitFn = () => Promise.resolve();

      await act(async () => {
        await result.current.handleSubmit(submitFn);
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('clears previous error on new submission', async () => {
      const { result } = renderHook(() => useFormSubmission());

      // First submission fails
      await act(async () => {
        await result.current.handleSubmit(() => Promise.reject(new Error('First error')));
      });
      expect(result.current.error).toBe('First error');

      // Second submission succeeds
      await act(async () => {
        await result.current.handleSubmit(() => Promise.resolve());
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('handleSubmit - error path', () => {
    it('sets error message from Error object', async () => {
      const { result } = renderHook(() => useFormSubmission());

      const submitFn = () => Promise.reject(new Error('Validation failed'));

      await act(async () => {
        await result.current.handleSubmit(submitFn);
      });

      expect(result.current.error).toBe('Validation failed');
    });

    it('sets generic error for non-Error throws', async () => {
      const { result } = renderHook(() => useFormSubmission());

      const submitFn = () => Promise.reject('string error');

      await act(async () => {
        await result.current.handleSubmit(submitFn);
      });

      expect(result.current.error).toBe('An error occurred');
    });

    it('returns undefined on error', async () => {
      const { result } = renderHook(() => useFormSubmission<{ id: string }>());

      const submitFn = () => Promise.reject(new Error('Failed'));

      let returnedResult: { id: string } | undefined;
      await act(async () => {
        returnedResult = await result.current.handleSubmit(submitFn);
      });

      expect(returnedResult).toBeUndefined();
    });

    it('sets isSubmitting to false after error', async () => {
      const { result } = renderHook(() => useFormSubmission());

      await act(async () => {
        await result.current.handleSubmit(() => Promise.reject(new Error('Error')));
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('does not call onSuccess on error', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useFormSubmission({
          onSuccess,
        })
      );

      await act(async () => {
        await result.current.handleSubmit(() => Promise.reject(new Error('Error')));
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('resetState', () => {
    it('clears error state', async () => {
      const { result } = renderHook(() => useFormSubmission());

      // Set error
      await act(async () => {
        await result.current.handleSubmit(() => Promise.reject(new Error('Error')));
      });
      expect(result.current.error).toBe('Error');

      // Reset
      act(() => {
        result.current.resetState();
      });
      expect(result.current.error).toBeNull();
    });

    it('clears success state', async () => {
      const { result } = renderHook(() =>
        useFormSubmission({
          successMessage: 'Success!',
        })
      );

      // Set success
      await act(async () => {
        await result.current.handleSubmit(() => Promise.resolve());
      });
      expect(result.current.success).toBe('Success!');

      // Reset
      act(() => {
        result.current.resetState();
      });
      expect(result.current.success).toBeNull();
    });
  });

  describe('setError', () => {
    it('allows manually setting error', () => {
      const { result } = renderHook(() => useFormSubmission());

      act(() => {
        result.current.setError('Manual error');
      });

      expect(result.current.error).toBe('Manual error');
    });

    it('allows clearing error with null', () => {
      const { result } = renderHook(() => useFormSubmission());

      act(() => {
        result.current.setError('Error');
      });
      expect(result.current.error).toBe('Error');

      act(() => {
        result.current.setError(null);
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('options stability', () => {
    it('maintains stable callback references', () => {
      const { result, rerender } = renderHook(() => useFormSubmission());

      const initialHandleSubmit = result.current.handleSubmit;
      const initialResetState = result.current.resetState;
      const initialSetError = result.current.setError;

      rerender();

      // These should be stable due to useCallback
      expect(result.current.resetState).toBe(initialResetState);
      expect(result.current.setError).toBe(initialSetError);
      // handleSubmit depends on options, but with same options should be stable
    });
  });
});
