import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './form-field';

describe('FormField', () => {
  describe('basic rendering', () => {
    it('renders label and children', () => {
      render(
        <FormField label="Email" name="email">
          <input type="email" id="email" />
        </FormField>
      );

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('associates label with input via htmlFor', () => {
      render(
        <FormField label="Username" name="username">
          <input type="text" id="username" />
        </FormField>
      );

      const label = screen.getByText('Username');
      expect(label).toHaveAttribute('for', 'username');
    });
  });

  describe('required indicator', () => {
    it('shows asterisk when required', () => {
      render(
        <FormField label="Email" name="email" required>
          <input type="email" id="email" />
        </FormField>
      );

      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('*')).toHaveClass('text-red-500');
    });

    it('does not show asterisk when not required', () => {
      render(
        <FormField label="Bio" name="bio">
          <textarea id="bio" />
        </FormField>
      );

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('does not show asterisk when required is false', () => {
      render(
        <FormField label="Optional" name="optional" required={false}>
          <input type="text" id="optional" />
        </FormField>
      );

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('description', () => {
    it('renders description when provided', () => {
      render(
        <FormField label="Password" name="password" description="Must be at least 8 characters">
          <input type="password" id="password" />
        </FormField>
      );

      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });

    it('does not render description element when not provided', () => {
      const { container } = render(
        <FormField label="Name" name="name">
          <input type="text" id="name" />
        </FormField>
      );

      // Check that there's no description paragraph
      const descriptions = container.querySelectorAll('.text-muted-foreground');
      expect(descriptions.length).toBe(0);
    });
  });

  describe('error handling', () => {
    it('displays error message when provided', () => {
      render(
        <FormField label="Email" name="email" error="Invalid email address">
          <input type="email" id="email" />
        </FormField>
      );

      const error = screen.getByText('Invalid email address');
      expect(error).toBeInTheDocument();
      expect(error).toHaveClass('text-red-600');
    });

    it('does not display error when null', () => {
      render(
        <FormField label="Email" name="email" error={null}>
          <input type="email" id="email" />
        </FormField>
      );

      expect(screen.queryByText(/error|invalid/i)).not.toBeInTheDocument();
    });

    it('does not display error when undefined', () => {
      render(
        <FormField label="Email" name="email">
          <input type="email" id="email" />
        </FormField>
      );

      // No error elements
      const errorElements = document.querySelectorAll('.text-red-600');
      // Only the asterisk for required would be red, but we didn't set required
      expect(errorElements.length).toBe(0);
    });
  });

  describe('complex children', () => {
    it('renders select elements', () => {
      render(
        <FormField label="Country" name="country">
          <select id="country">
            <option value="us">United States</option>
            <option value="ca">Canada</option>
          </select>
        </FormField>
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    it('renders textarea elements', () => {
      render(
        <FormField label="Description" name="description">
          <textarea id="description" placeholder="Enter description" />
        </FormField>
      );

      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
    });

    it('renders custom components', () => {
      const CustomInput = () => <div data-testid="custom-input">Custom Input</div>;

      render(
        <FormField label="Custom" name="custom">
          <CustomInput />
        </FormField>
      );

      expect(screen.getByTestId('custom-input')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <FormField label="Test" name="test" className="custom-class">
          <input type="text" id="test" />
        </FormField>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('maintains base spacing class', () => {
      const { container } = render(
        <FormField label="Test" name="test">
          <input type="text" id="test" />
        </FormField>
      );

      expect(container.firstChild).toHaveClass('space-y-2');
    });
  });

  describe('full integration', () => {
    it('renders all elements together correctly', () => {
      render(
        <FormField
          label="Email Address"
          name="email"
          required
          description="We'll never share your email"
          error="Please enter a valid email"
        >
          <input type="email" id="email" placeholder="you@example.com" />
        </FormField>
      );

      // Label with required indicator
      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();

      // Description
      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();

      // Input
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();

      // Error
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    });
  });
});
