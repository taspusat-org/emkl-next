import { formatDateToDDMMYYYY } from '@/lib/utils';

describe('formatDateToDDMMYYYY', () => {
  test('should format Date object to DD-MM-YYYY', () => {
    const date = new Date('2024-03-15');
    expect(formatDateToDDMMYYYY(date)).toBe('15-03-2024');
  });

  test('should format string date to DD-MM-YYYY', () => {
    expect(formatDateToDDMMYYYY('2024-12-25')).toBe('25-12-2024');
    expect(formatDateToDDMMYYYY('2024-01-01')).toBe('01-01-2024');
  });

  test('should handle different date formats', () => {
    const date = new Date('2024-06-30T10:30:00');
    expect(formatDateToDDMMYYYY(date)).toMatch(/30-06-2024/);
  });

  test('should pad single-digit days and months', () => {
    const date = new Date('2024-01-05');
    expect(formatDateToDDMMYYYY(date)).toBe('05-01-2024');
  });
});
