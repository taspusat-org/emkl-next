import { parseCurrency } from '@/lib/utils';

describe('parseCurrency', () => {
  test('should remove commas from currency string and return number', () => {
    expect(parseCurrency('100,000')).toBe(100000);
    expect(parseCurrency('1,500,000.50')).toBe(1500000.5);
    expect(parseCurrency('50,000')).toBe(50000);
  });

  test('should handle numbers with decimals', () => {
    expect(parseCurrency('100000.00')).toBe(100000);
    expect(parseCurrency('1500000.50')).toBe(1500000.5);
  });

  test('should handle empty and zero values', () => {
    expect(parseCurrency('')).toBe(0);
    expect(parseCurrency('0')).toBe(0);
  });

  test('should handle plain numbers', () => {
    expect(parseCurrency('100000')).toBe(100000);
    expect(parseCurrency('1500000.50')).toBe(1500000.5);
  });

  test('should trim whitespace', () => {
    expect(parseCurrency(' 100000 ')).toBe(100000);
    expect(parseCurrency('  1500000.50  ')).toBe(1500000.5);
  });
});
