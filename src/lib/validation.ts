/**
 * Form Validation Utilities
 *
 * Lightweight validation system for form data
 */

export type ValidationRule<T = unknown> = {
  required?: boolean | string; // true, false, or custom error message
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: T) => string | true; // return error message or true if valid
};

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * Validates form data against a validation schema
 *
 * @example
 * ```ts
 * const schema: ValidationSchema<FormData> = {
 *   email: {
 *     required: true,
 *     pattern: {
 *       value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
 *       message: 'Please enter a valid email address'
 *     }
 *   },
 *   name: {
 *     required: 'Name is required',
 *     minLength: { value: 2, message: 'Name must be at least 2 characters' }
 *   }
 * };
 *
 * const errors = validateForm(formData, schema);
 * ```
 */
export function validateForm<T>(data: T, schema: ValidationSchema<T>): ValidationErrors<T> {
  const errors: ValidationErrors<T> = {};

  for (const field in schema) {
    const rules = schema[field];
    if (!rules) continue;

    const value = data[field];

    // Required validation
    if (rules.required) {
      const isEmpty =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        errors[field] =
          typeof rules.required === 'string' ? rules.required : `${String(field)} is required`;
        continue; // Skip other validations if required fails
      }
    }

    // Skip other validations if value is empty and not required
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // MinLength validation
    if (rules.minLength && typeof value === 'string') {
      if (value.length < rules.minLength.value) {
        errors[field] = rules.minLength.message;
        continue;
      }
    }

    // MaxLength validation
    if (rules.maxLength && typeof value === 'string') {
      if (value.length > rules.maxLength.value) {
        errors[field] = rules.maxLength.message;
        continue;
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string') {
      if (!rules.pattern.value.test(value)) {
        errors[field] = rules.pattern.message;
        continue;
      }
    }

    // Custom validation
    if (rules.validate) {
      const result = rules.validate(value);
      if (result !== true) {
        errors[field] = result;
      }
    }
  }

  return errors;
}

/**
 * Checks if there are any validation errors
 */
export function hasErrors<T>(errors: ValidationErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Common validation patterns
 */
export const patterns = {
  email: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  url: {
    value: /^https?:\/\/.+\..+/,
    message: 'Please enter a valid URL',
  },
  slug: {
    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  },
  phone: {
    value: /^\+?[\d\s\-()]+$/,
    message: 'Please enter a valid phone number',
  },
};
