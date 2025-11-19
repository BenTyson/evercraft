/**
 * Formatting Utilities
 *
 * Shared utilities for formatting currency, dates, and other data types.
 * Consolidates formatting logic used across the application.
 */

/**
 * Formats a number as USD currency
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(
  amount: number,
  options?: {
    /** Show decimal places (default: true) */
    showDecimals?: boolean;
    /** Include currency symbol (default: true) */
    showSymbol?: boolean;
    /** Use locale-specific formatting (default: false for consistency) */
    useLocale?: boolean;
  }
): string {
  const { showDecimals = true, showSymbol = true, useLocale = false } = options || {};

  const symbol = showSymbol ? '$' : '';

  if (useLocale) {
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    })}`;
  }

  // Simple formatting for consistency across the app
  const formatted = showDecimals ? amount.toFixed(2) : Math.round(amount).toString();
  return `${symbol}${formatted}`;
}

/**
 * Formats a number as a percentage
 * @param value - The value to format (0-100 or 0-1 depending on isDecimal)
 * @param options - Optional formatting options
 * @returns Formatted percentage string (e.g., "23.5%")
 */
export function formatPercentage(
  value: number,
  options?: {
    /** Value is already a decimal (0-1) vs percentage (0-100) */
    isDecimal?: boolean;
    /** Number of decimal places to show (default: 1) */
    decimals?: number;
  }
): string {
  const { isDecimal = false, decimals = 1 } = options || {};

  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Formats a number with locale-specific thousand separators
 * @param value - The number to format
 * @returns Formatted number string (e.g., "1,234")
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

/**
 * Abbreviates large numbers with K/M/B suffixes
 * @param value - The number to abbreviate
 * @returns Abbreviated string (e.g., "1.2K", "3.4M")
 */
export function abbreviateNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}
