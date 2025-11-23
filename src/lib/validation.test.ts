import { describe, it, expect } from 'vitest';
import { validateForm, hasErrors, patterns, ValidationSchema } from './validation';

describe('validateForm', () => {
  describe('required validation', () => {
    it('fails when required field is undefined', () => {
      const schema: ValidationSchema<{ name: string }> = {
        name: { required: true },
      };
      const errors = validateForm({ name: undefined as unknown as string }, schema);
      expect(errors.name).toBe('name is required');
    });

    it('fails when required field is null', () => {
      const schema: ValidationSchema<{ name: string | null }> = {
        name: { required: true },
      };
      const errors = validateForm({ name: null }, schema);
      expect(errors.name).toBe('name is required');
    });

    it('fails when required field is empty string', () => {
      const schema: ValidationSchema<{ name: string }> = {
        name: { required: true },
      };
      const errors = validateForm({ name: '' }, schema);
      expect(errors.name).toBe('name is required');
    });

    it('fails when required array is empty', () => {
      const schema: ValidationSchema<{ tags: string[] }> = {
        tags: { required: true },
      };
      const errors = validateForm({ tags: [] }, schema);
      expect(errors.tags).toBe('tags is required');
    });

    it('uses custom error message when provided', () => {
      const schema: ValidationSchema<{ email: string }> = {
        email: { required: 'Email address is required' },
      };
      const errors = validateForm({ email: '' }, schema);
      expect(errors.email).toBe('Email address is required');
    });

    it('passes when required field has value', () => {
      const schema: ValidationSchema<{ name: string }> = {
        name: { required: true },
      };
      const errors = validateForm({ name: 'John' }, schema);
      expect(errors.name).toBeUndefined();
    });
  });

  describe('minLength validation', () => {
    it('fails when string is too short', () => {
      const schema: ValidationSchema<{ password: string }> = {
        password: {
          minLength: { value: 8, message: 'Password must be at least 8 characters' },
        },
      };
      const errors = validateForm({ password: 'abc' }, schema);
      expect(errors.password).toBe('Password must be at least 8 characters');
    });

    it('passes when string meets minimum length', () => {
      const schema: ValidationSchema<{ password: string }> = {
        password: {
          minLength: { value: 8, message: 'Password must be at least 8 characters' },
        },
      };
      const errors = validateForm({ password: 'password123' }, schema);
      expect(errors.password).toBeUndefined();
    });

    it('skips minLength check on empty optional field', () => {
      const schema: ValidationSchema<{ bio: string }> = {
        bio: {
          minLength: { value: 10, message: 'Bio must be at least 10 characters' },
        },
      };
      const errors = validateForm({ bio: '' }, schema);
      expect(errors.bio).toBeUndefined();
    });
  });

  describe('maxLength validation', () => {
    it('fails when string exceeds maximum length', () => {
      const schema: ValidationSchema<{ title: string }> = {
        title: {
          maxLength: { value: 50, message: 'Title must be 50 characters or less' },
        },
      };
      const errors = validateForm({ title: 'a'.repeat(51) }, schema);
      expect(errors.title).toBe('Title must be 50 characters or less');
    });

    it('passes when string is within maximum length', () => {
      const schema: ValidationSchema<{ title: string }> = {
        title: {
          maxLength: { value: 50, message: 'Title must be 50 characters or less' },
        },
      };
      const errors = validateForm({ title: 'Short title' }, schema);
      expect(errors.title).toBeUndefined();
    });
  });

  describe('pattern validation', () => {
    it('fails when pattern does not match', () => {
      const schema: ValidationSchema<{ email: string }> = {
        email: {
          pattern: patterns.email,
        },
      };
      const errors = validateForm({ email: 'not-an-email' }, schema);
      expect(errors.email).toBe('Please enter a valid email address');
    });

    it('passes when pattern matches', () => {
      const schema: ValidationSchema<{ email: string }> = {
        email: {
          pattern: patterns.email,
        },
      };
      const errors = validateForm({ email: 'test@example.com' }, schema);
      expect(errors.email).toBeUndefined();
    });

    it('skips pattern check on empty optional field', () => {
      const schema: ValidationSchema<{ website: string }> = {
        website: {
          pattern: patterns.url,
        },
      };
      const errors = validateForm({ website: '' }, schema);
      expect(errors.website).toBeUndefined();
    });
  });

  describe('custom validate function', () => {
    it('fails when validate returns error message', () => {
      const schema: ValidationSchema<{ age: number }> = {
        age: {
          validate: (value) => (value < 18 ? 'Must be 18 or older' : true),
        },
      };
      const errors = validateForm({ age: 16 }, schema);
      expect(errors.age).toBe('Must be 18 or older');
    });

    it('passes when validate returns true', () => {
      const schema: ValidationSchema<{ age: number }> = {
        age: {
          validate: (value) => (value < 18 ? 'Must be 18 or older' : true),
        },
      };
      const errors = validateForm({ age: 21 }, schema);
      expect(errors.age).toBeUndefined();
    });
  });

  describe('combined validations', () => {
    it('stops at first failing validation (required)', () => {
      const schema: ValidationSchema<{ email: string }> = {
        email: {
          required: true,
          pattern: patterns.email,
        },
      };
      const errors = validateForm({ email: '' }, schema);
      expect(errors.email).toBe('email is required');
    });

    it('validates multiple fields', () => {
      interface FormData {
        name: string;
        email: string;
        age: number;
      }
      const schema: ValidationSchema<FormData> = {
        name: { required: true },
        email: { required: true, pattern: patterns.email },
        age: { validate: (v) => (v < 18 ? 'Must be 18+' : true) },
      };
      const errors = validateForm({ name: '', email: 'bad', age: 16 }, schema);
      expect(errors.name).toBe('name is required');
      expect(errors.email).toBe('Please enter a valid email address');
      expect(errors.age).toBe('Must be 18+');
    });
  });
});

describe('hasErrors', () => {
  it('returns true when errors object has properties', () => {
    expect(hasErrors({ name: 'Required' })).toBe(true);
  });

  it('returns false when errors object is empty', () => {
    expect(hasErrors({})).toBe(false);
  });

  it('returns true with multiple errors', () => {
    expect(hasErrors({ name: 'Required', email: 'Invalid' })).toBe(true);
  });
});

describe('patterns', () => {
  describe('email pattern', () => {
    const emailPattern = patterns.email.value;

    it('matches valid emails', () => {
      expect(emailPattern.test('test@example.com')).toBe(true);
      expect(emailPattern.test('user.name@domain.co.uk')).toBe(true);
      expect(emailPattern.test('user+tag@example.org')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(emailPattern.test('not-an-email')).toBe(false);
      expect(emailPattern.test('@example.com')).toBe(false);
      expect(emailPattern.test('test@')).toBe(false);
      expect(emailPattern.test('test @example.com')).toBe(false);
    });
  });

  describe('url pattern', () => {
    const urlPattern = patterns.url.value;

    it('matches valid URLs', () => {
      expect(urlPattern.test('https://example.com')).toBe(true);
      expect(urlPattern.test('http://example.com/path')).toBe(true);
      expect(urlPattern.test('https://sub.domain.com')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(urlPattern.test('example.com')).toBe(false);
      expect(urlPattern.test('ftp://example.com')).toBe(false);
      expect(urlPattern.test('not a url')).toBe(false);
    });
  });

  describe('slug pattern', () => {
    const slugPattern = patterns.slug.value;

    it('matches valid slugs', () => {
      expect(slugPattern.test('my-shop')).toBe(true);
      expect(slugPattern.test('product123')).toBe(true);
      expect(slugPattern.test('eco-friendly-items')).toBe(true);
    });

    it('rejects invalid slugs', () => {
      expect(slugPattern.test('My-Shop')).toBe(false);
      expect(slugPattern.test('my_shop')).toBe(false);
      expect(slugPattern.test('my--shop')).toBe(false);
      expect(slugPattern.test('-my-shop')).toBe(false);
    });
  });

  describe('phone pattern', () => {
    const phonePattern = patterns.phone.value;

    it('matches valid phone numbers', () => {
      expect(phonePattern.test('1234567890')).toBe(true);
      expect(phonePattern.test('+1 (555) 123-4567')).toBe(true);
      expect(phonePattern.test('555-123-4567')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(phonePattern.test('not a phone')).toBe(false);
      expect(phonePattern.test('123-abc-4567')).toBe(false);
    });
  });
});
