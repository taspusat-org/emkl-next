import { kapalSchema, KapalInput } from '@/lib/validations/kapal.validation';

describe('Kapal Schema Validation', () => {
  describe('Valid Data', () => {
    test('should validate complete valid data', () => {
      const validData: KapalInput = {
        id: 1,
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: 1,
        pelayaran: 'Pelayaran Test',
        statusaktif: 1,
        statusaktif_nama: 'AKTIF'
      };

      const result = kapalSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    test('should validate data without optional fields', () => {
      const validData = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: 1,
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('should allow null for optional fields', () => {
      const validData = {
        id: null,
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: 1,
        pelayaran: null,
        statusaktif: 1,
        statusaktif_nama: null
      };

      const result = kapalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid Data - NAMA field', () => {
    test('should fail when nama is empty string', () => {
      const invalidData = {
        nama: '',
        keterangan: 'Keterangan Test',
        pelayaran_id: 1,
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('nama');
        expect(result.error.issues[0].message).toMatch(/NAMA/i);
      }
    });

    test('should fail when nama is missing', () => {
      const invalidData = {
        keterangan: 'Keterangan Test',
        pelayaran_id: 1,
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.path.includes('nama'))
        ).toBe(true);
      }
    });
  });

  describe('Invalid Data - KETERANGAN field', () => {
    test('should fail when keterangan is empty string', () => {
      const invalidData = {
        nama: 'Kapal Test',
        keterangan: '',
        pelayaran_id: 1,
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('keterangan');
        expect(result.error.issues[0].message).toMatch(/KETERANGAN/i);
      }
    });

    test('should fail when keterangan is missing', () => {
      const invalidData = {
        nama: 'Kapal Test',
        pelayaran_id: 1,
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.path.includes('keterangan'))
        ).toBe(true);
      }
    });
  });

  describe('Invalid Data - PELAYARAN_ID field', () => {
    test('should fail when pelayaran_id is 0', () => {
      const invalidData = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: 0,
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('pelayaran_id');
        expect(result.error.issues[0].message).toMatch(/PELAYARAN/i);
      }
    });

    test('should fail when pelayaran_id is negative', () => {
      const invalidData = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: -1,
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('pelayaran_id');
      }
    });

    test('should fail when pelayaran_id is missing', () => {
      const invalidData = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.path.includes('pelayaran_id')
          )
        ).toBe(true);
      }
    });
  });

  describe('Invalid Data - STATUSAKTIF field', () => {
    test('should fail when statusaktif is 0', () => {
      const invalidData = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: 1,
        statusaktif: 0
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('statusaktif');
        expect(result.error.issues[0].message).toMatch(/STATUSAKTIF/i);
      }
    });

    test('should fail when statusaktif is negative', () => {
      const invalidData = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: 1,
        statusaktif: -1
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('statusaktif');
      }
    });

    test('should fail when statusaktif is missing', () => {
      const invalidData = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: 1
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.path.includes('statusaktif')
          )
        ).toBe(true);
      }
    });
  });

  describe('Multiple Validation Errors', () => {
    test('should return all validation errors when multiple fields are invalid', () => {
      const invalidData = {
        nama: '',
        keterangan: '',
        pelayaran_id: 0,
        statusaktif: 0
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(4);

        const errorPaths = result.error.issues.map((issue) => issue.path[0]);
        expect(errorPaths).toContain('nama');
        expect(errorPaths).toContain('keterangan');
        expect(errorPaths).toContain('pelayaran_id');
        expect(errorPaths).toContain('statusaktif');
      }
    });

    test('should handle completely empty object', () => {
      const invalidData = {};

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases', () => {
    test('should accept valid minimum values', () => {
      const validData = {
        nama: 'A', // Minimum 1 character
        keterangan: 'A',
        pelayaran_id: 1, // Minimum value 1
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('should accept long string values', () => {
      const validData = {
        nama: 'A'.repeat(1000),
        keterangan: 'B'.repeat(1000),
        pelayaran_id: 1,
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('should accept large number values', () => {
      const validData = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: 999999,
        statusaktif: 999999
      };

      const result = kapalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('should handle special characters in string fields', () => {
      const validData = {
        nama: 'Kapal-Test_123 & Co.',
        keterangan: 'Keterangan with special chars: @#$%^&*()',
        pelayaran_id: 1,
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('should handle unicode characters', () => {
      const validData = {
        nama: 'Kapal 船舶 السفينة',
        keterangan: 'Keterangan 説明 الوصف',
        pelayaran_id: 1,
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Type Validation', () => {
    test('should fail when nama is not a string', () => {
      const invalidData = {
        nama: 123,
        keterangan: 'Keterangan Test',
        pelayaran_id: 1,
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('should fail when pelayaran_id is not a number', () => {
      const invalidData = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: '1',
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('should fail when statusaktif is not a number', () => {
      const invalidData = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: 1,
        statusaktif: '1'
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Error Messages', () => {
    test('should provide descriptive error message for empty nama', () => {
      const invalidData = {
        nama: '',
        keterangan: 'Keterangan Test',
        pelayaran_id: 1,
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const namaError = result.error.issues.find((issue) =>
          issue.path.includes('nama')
        );
        expect(namaError?.message).toBeTruthy();
        expect(namaError?.message).toMatch(/NAMA.*Harus Diisi/i);
      }
    });

    test('should provide descriptive error message for invalid pelayaran_id', () => {
      const invalidData = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: 0,
        statusaktif: 1
      };

      const result = kapalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const pelayaranError = result.error.issues.find((issue) =>
          issue.path.includes('pelayaran_id')
        );
        expect(pelayaranError?.message).toBeTruthy();
        expect(pelayaranError?.message).toMatch(/PELAYARAN.*Harus Diisi/i);
      }
    });
  });
});
