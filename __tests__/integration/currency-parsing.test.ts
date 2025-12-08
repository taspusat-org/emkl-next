import { parseCurrency } from '@/lib/utils';

describe('parseCurrency Integration Test', () => {
  test('should correctly parse and convert currency in form submission', () => {
    // Simulate user input with comma separators
    const userInput = '1,500,000.50';

    // Simulate form submission where parseCurrency is called
    const parsedNominal = parseCurrency(userInput);

    // Should convert to number correctly
    expect(parsedNominal).toBe(1500000.5);
    expect(typeof parsedNominal).toBe('number');
  });

  test('should handle array of currency values', () => {
    const containerRows = [
      { container_id: 1, nominal: '100,000.00' },
      { container_id: 2, nominal: '250,000.50' },
      { container_id: 3, nominal: '500,000' }
    ];

    // Simulate parsing array of values (like in hargajual)
    const hargajualData = containerRows.map((row) => ({
      container_id: row.container_id,
      nominal: parseCurrency(row.nominal)
    }));

    expect(hargajualData).toEqual([
      { container_id: 1, nominal: 100000.0 },
      { container_id: 2, nominal: 250000.5 },
      { container_id: 3, nominal: 500000 }
    ]);
  });

  test('should handle edge cases in currency parsing', () => {
    expect(parseCurrency('')).toBe(0);
    expect(parseCurrency('0')).toBe(0);
    expect(parseCurrency('1')).toBe(1);
    expect(parseCurrency('1000')).toBe(1000);
    expect(parseCurrency('1,000.50')).toBe(1000.5);
  });
});
