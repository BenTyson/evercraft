import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage, formatNumber, abbreviateNumber } from './format';

describe('formatCurrency', () => {
  describe('basic formatting', () => {
    it('formats positive numbers with decimals', () => {
      expect(formatCurrency(1234.56)).toBe('$1234.56');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats negative numbers', () => {
      expect(formatCurrency(-50.99)).toBe('$-50.99');
    });

    it('formats small decimals correctly', () => {
      expect(formatCurrency(0.99)).toBe('$0.99');
    });

    it('rounds to 2 decimal places', () => {
      expect(formatCurrency(10.999)).toBe('$11.00');
      expect(formatCurrency(10.994)).toBe('$10.99');
    });
  });

  describe('options', () => {
    it('hides decimals when showDecimals is false', () => {
      expect(formatCurrency(1234.56, { showDecimals: false })).toBe('$1235');
    });

    it('hides symbol when showSymbol is false', () => {
      expect(formatCurrency(1234.56, { showSymbol: false })).toBe('1234.56');
    });

    it('combines options correctly', () => {
      expect(formatCurrency(1234.56, { showDecimals: false, showSymbol: false })).toBe('1235');
    });

    it('uses locale formatting when useLocale is true', () => {
      expect(formatCurrency(1234.56, { useLocale: true })).toBe('$1,234.56');
    });

    it('combines locale with no decimals', () => {
      expect(formatCurrency(1234.56, { useLocale: true, showDecimals: false })).toBe('$1,235');
    });
  });
});

describe('formatPercentage', () => {
  describe('percentage values (0-100)', () => {
    it('formats whole percentages', () => {
      expect(formatPercentage(50)).toBe('50.0%');
    });

    it('formats decimal percentages', () => {
      expect(formatPercentage(33.333)).toBe('33.3%');
    });

    it('formats zero', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('formats 100%', () => {
      expect(formatPercentage(100)).toBe('100.0%');
    });
  });

  describe('decimal values (0-1)', () => {
    it('converts decimal to percentage when isDecimal is true', () => {
      expect(formatPercentage(0.5, { isDecimal: true })).toBe('50.0%');
    });

    it('handles small decimals', () => {
      expect(formatPercentage(0.065, { isDecimal: true })).toBe('6.5%');
    });
  });

  describe('custom decimals', () => {
    it('shows 0 decimal places', () => {
      expect(formatPercentage(33.333, { decimals: 0 })).toBe('33%');
    });

    it('shows 2 decimal places', () => {
      expect(formatPercentage(33.333, { decimals: 2 })).toBe('33.33%');
    });
  });
});

describe('formatNumber', () => {
  it('formats small numbers without separators', () => {
    expect(formatNumber(123)).toBe('123');
  });

  it('formats thousands with comma separator', () => {
    expect(formatNumber(1234)).toBe('1,234');
  });

  it('formats millions with comma separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('formats negative numbers', () => {
    expect(formatNumber(-1234)).toBe('-1,234');
  });
});

describe('abbreviateNumber', () => {
  describe('no abbreviation needed', () => {
    it('returns small numbers as-is', () => {
      expect(abbreviateNumber(0)).toBe('0');
      expect(abbreviateNumber(999)).toBe('999');
    });
  });

  describe('thousands (K)', () => {
    it('abbreviates 1000 as 1.0K', () => {
      expect(abbreviateNumber(1000)).toBe('1.0K');
    });

    it('abbreviates with decimal', () => {
      expect(abbreviateNumber(1500)).toBe('1.5K');
    });

    it('abbreviates large thousands', () => {
      expect(abbreviateNumber(999999)).toBe('1000.0K');
    });
  });

  describe('millions (M)', () => {
    it('abbreviates 1 million as 1.0M', () => {
      expect(abbreviateNumber(1000000)).toBe('1.0M');
    });

    it('abbreviates with decimal', () => {
      expect(abbreviateNumber(2500000)).toBe('2.5M');
    });

    it('abbreviates large millions', () => {
      expect(abbreviateNumber(999999999)).toBe('1000.0M');
    });
  });

  describe('billions (B)', () => {
    it('abbreviates 1 billion as 1.0B', () => {
      expect(abbreviateNumber(1000000000)).toBe('1.0B');
    });

    it('abbreviates with decimal', () => {
      expect(abbreviateNumber(3500000000)).toBe('3.5B');
    });
  });
});
