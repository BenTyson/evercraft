/**
 * Product Variants Type Definitions
 *
 * Types and constants for the product variants system.
 * Supports up to 2 option types with 70 values each (Etsy standard).
 */

/**
 * Predefined variant option types commonly used by sellers
 */
export const PREDEFINED_OPTION_TYPES = [
  'Size',
  'Color',
  'Material',
  'Style',
  'Finish',
  'Pattern',
] as const;

export type PredefinedOptionType = (typeof PREDEFINED_OPTION_TYPES)[number];

/**
 * Variant system limits (Etsy standard)
 */
export const MAX_OPTION_TYPES = 2;
export const MAX_VALUES_PER_TYPE = 70;
export const MAX_OPTION_NAME_LENGTH = 20;
export const MAX_VALUE_NAME_LENGTH = 20;

/**
 * A single variant option (e.g., "Size", "Color")
 */
export interface VariantOption {
  name: string; // "Size", "Color", or custom type
  position: number; // Display order (0-indexed)
  values: string[]; // ["Small", "Medium", "Large"]
  isCustom: boolean; // true if not in PREDEFINED_OPTION_TYPES
}

/**
 * Complete variant options structure stored in Product.variantOptions
 */
export interface VariantOptionsData {
  options: VariantOption[];
}

/**
 * Input for creating/updating a single product variant
 */
export interface VariantInput {
  name: string; // Combination name (e.g., "Small / Red")
  sku?: string | null; // Optional unique SKU
  price?: number | null; // null = inherit from product price
  inventoryQuantity: number;
  trackInventory: boolean;
  imageId?: string | null; // Link to specific ProductImage
}

/**
 * Extended variant data with computed fields (for display)
 */
export interface VariantDisplay extends VariantInput {
  id?: string; // Prisma ID (for existing variants)
  effectivePrice: number; // Resolved price (override or inherited)
  imageSrc?: string | null; // Image URL if linked
  inventoryStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
}

/**
 * Variant combination for selector state
 */
export interface VariantCombination {
  [optionName: string]: string; // { "Size": "Large", "Color": "Red" }
}

/**
 * Selected variant info for cart/checkout
 */
export interface SelectedVariant {
  variantId: string;
  variantName: string; // "Size: Large, Color: Red"
  price: number;
  imageUrl?: string;
  sku?: string;
}

/**
 * Validation result for variant options
 */
export interface VariantValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Helper: Generate display name from option values
 * @example formatVariantName({ "Size": "Large", "Color": "Red" }) => "Large / Red"
 */
export function formatVariantName(combination: VariantCombination): string {
  return Object.values(combination).join(' / ');
}

/**
 * Helper: Parse variant name back to combination
 * @example parseVariantName("Large / Red", ["Size", "Color"]) => { "Size": "Large", "Color": "Red" }
 */
export function parseVariantName(name: string, optionNames: string[]): VariantCombination | null {
  const values = name.split(' / ').map((v) => v.trim());
  if (values.length !== optionNames.length) return null;

  const combination: VariantCombination = {};
  optionNames.forEach((optionName, index) => {
    combination[optionName] = values[index];
  });
  return combination;
}

/**
 * Helper: Generate all variant combinations from options
 * @example
 * generateCombinations([
 *   { name: "Size", values: ["S", "M"] },
 *   { name: "Color", values: ["Red", "Blue"] }
 * ])
 * // Returns: [
 * //   { "Size": "S", "Color": "Red" },
 * //   { "Size": "S", "Color": "Blue" },
 * //   { "Size": "M", "Color": "Red" },
 * //   { "Size": "M", "Color": "Blue" }
 * // ]
 */
export function generateCombinations(
  options: Pick<VariantOption, 'name' | 'values'>[]
): VariantCombination[] {
  if (options.length === 0) return [];
  if (options.length === 1) {
    return options[0].values.map((value) => ({ [options[0].name]: value }));
  }

  // Cartesian product for 2 options
  const [option1, option2] = options;
  const combinations: VariantCombination[] = [];

  for (const value1 of option1.values) {
    for (const value2 of option2.values) {
      combinations.push({
        [option1.name]: value1,
        [option2.name]: value2,
      });
    }
  }

  return combinations;
}

/**
 * Helper: Validate variant options
 */
export function validateVariantOptions(data: VariantOptionsData): VariantValidationResult {
  const errors: string[] = [];

  // Check max option types
  if (data.options.length > MAX_OPTION_TYPES) {
    errors.push(`Maximum ${MAX_OPTION_TYPES} option types allowed`);
  }

  // Check each option
  for (const option of data.options) {
    // Check option name length
    if (option.name.length > MAX_OPTION_NAME_LENGTH) {
      errors.push(`Option name "${option.name}" exceeds ${MAX_OPTION_NAME_LENGTH} characters`);
    }

    // Check option name not empty
    if (!option.name.trim()) {
      errors.push('Option name cannot be empty');
    }

    // Check max values per type
    if (option.values.length > MAX_VALUES_PER_TYPE) {
      errors.push(
        `Option "${option.name}" has ${option.values.length} values (max ${MAX_VALUES_PER_TYPE})`
      );
    }

    // Check value names
    for (const value of option.values) {
      if (value.length > MAX_VALUE_NAME_LENGTH) {
        errors.push(
          `Value "${value}" in "${option.name}" exceeds ${MAX_VALUE_NAME_LENGTH} characters`
        );
      }
      if (!value.trim()) {
        errors.push(`Empty value in option "${option.name}"`);
      }
    }

    // Check duplicate values
    const uniqueValues = new Set(option.values);
    if (uniqueValues.size !== option.values.length) {
      errors.push(`Duplicate values in option "${option.name}"`);
    }
  }

  // Check duplicate option names
  const optionNames = data.options.map((opt) => opt.name);
  const uniqueOptionNames = new Set(optionNames);
  if (uniqueOptionNames.size !== optionNames.length) {
    errors.push('Duplicate option names not allowed');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Helper: Calculate inventory status
 */
export function getInventoryStatus(
  quantity: number,
  trackInventory: boolean,
  lowStockThreshold?: number
): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (!trackInventory) return 'in_stock';
  if (quantity === 0) return 'out_of_stock';
  if (lowStockThreshold && quantity <= lowStockThreshold) return 'low_stock';
  return 'in_stock';
}

/**
 * Helper: Check if variant option type is predefined
 */
export function isPredefinedType(typeName: string): typeName is PredefinedOptionType {
  return PREDEFINED_OPTION_TYPES.includes(typeName as PredefinedOptionType);
}
