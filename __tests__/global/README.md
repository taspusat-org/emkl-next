# Dashboard Modules Global Test

## Overview

Unit test global yang melakukan scanning dan validasi terhadap semua module di folder `app/dashboard`. Test ini memastikan setiap module memiliki struktur, fungsi, dan properti wajib yang konsisten.

## Purpose

- ✅ Validasi struktur Grid Components
- ✅ Validasi struktur Form Components
- ✅ Validasi API Integration (CRUD hooks)
- ✅ Validasi State Management
- ✅ Validasi required functions dan methods
- ✅ Generate detailed logs untuk troubleshooting

## Test Coverage

### Grid Components

**Required States:**

- `rows` state (array)
- `selectedRow` state
- `filters` state
- `currentPage` state
- `hasMore` state (optional)

**Required Refs:**

- `gridRef` (DataGridHandle)

**Required Hooks:**

- GET/Fetch hook
- CREATE/Add hook
- UPDATE/Edit hook
- DELETE/Remove hook

**Required Functions:**

- `handleAdd`
- `handleEdit`
- `handleDelete`
- `handleScroll` (infinite scroll)
- `onSubmit`

**Required Grid Config:**

- `columns` definition
- `<DataGrid>` component
- `rowKeyGetter` function

**Required Form Integration:**

- `useForm` from react-hook-form
- `zodResolver` for validation

### Form Components

**Required Props:**

- `mode`
- `forms`
- `popOver`
- `onSubmit`

**Required Form Fields:**

- `<FormField>` component
- `<FormControl>` component

**Required Buttons:**

- Submit button
- Cancel/Close button

### API Integration

- Complete CRUD operations (GET, CREATE, UPDATE, DELETE)
- Proper hook naming conventions

## Running Tests

### Run all tests

```bash
npm test __tests__/global/dashboard-modules.test.ts
```

### Run with coverage

```bash
npm test __tests__/global/dashboard-modules.test.ts -- --coverage
```

### Run in watch mode

```bash
npm test __tests__/global/dashboard-modules.test.ts -- --watch
```

## Log Files

Test akan menghasilkan 2 file log di folder `__tests__/logs/`:

### 1. `dashboard-modules-test.log`

Summary log dengan hasil test untuk setiap module:

```
========================================
DASHBOARD MODULES TEST SUMMARY
========================================
Test Duration: 2.45s
Total Logs: 156
✓ Success: 120
⚠ Warnings: 10
✗ Errors: 26
========================================

[2025-11-26T10:30:15.123Z] [SUCCESS] akun-pusat: PASSED
[2025-11-26T10:30:15.234Z] [ERROR] kapal: FAILED (Grid: PASS, Form: FAIL)
...
```

### 2. `dashboard-modules-detailed.log`

Detailed log dengan informasi lengkap setiap check:

```
[2025-11-26T10:30:15.123Z] akun-pusat - Grid - States - PASS: rows state
[2025-11-26T10:30:15.124Z] akun-pusat - Grid - States - PASS: selectedRow state
[2025-11-26T10:30:15.125Z] akun-pusat - Grid - Hooks - FAIL: CREATE hook (required)
...
```

## Log Management

- **Auto-cleanup**: Previous log files dihapus otomatis setiap kali test dijalankan
- **Timestamp**: Setiap log entry memiliki timestamp ISO 8601
- **Level**: INFO, WARN, ERROR, SUCCESS
- **Location**: `__tests__/logs/`

## Configuration

### Exclude Folders

Folder yang di-exclude dari scanning:

```typescript
const EXCLUDE_FOLDERS = ['layout.tsx', 'page.tsx', 'error', '__tests__'];
```

### Custom Patterns

Anda bisa menambahkan pattern baru di:

- `REQUIRED_GRID_PATTERNS`
- `REQUIRED_FORM_PATTERNS`

Example:

```typescript
const REQUIRED_GRID_PATTERNS = {
  states: [
    { pattern: /useState.*customState/, name: 'customState', required: true }
    // ...
  ]
};
```

## Interpreting Results

### ✓ Success (Green)

- All required patterns found
- Module follows best practices

### ⚠ Warning (Yellow)

- Optional patterns missing
- Module functional but could be improved

### ✗ Error (Red)

- Required patterns missing
- Module tidak memenuhi standar minimum

## Best Practices

1. **Consistent Naming**: Gunakan naming convention yang sama untuk semua module

   - Grid: `Grid[ModuleName].tsx`
   - Form: `Form[ModuleName].tsx`

2. **Required Functions**: Pastikan semua CRUD functions ada

   - `handleAdd`, `handleEdit`, `handleDelete`, `onSubmit`

3. **API Hooks**: Gunakan custom hooks untuk API calls

   - `useGetXxx`, `useCreateXxx`, `useUpdateXxx`, `useDeleteXxx`

4. **State Management**: Konsisten dalam state structure

   - `rows`, `selectedRow`, `filters`, `currentPage`

5. **Form Integration**: Selalu gunakan react-hook-form + zod
   - `useForm`, `zodResolver`

## Troubleshooting

### Test Fails

1. Check detailed log: `__tests__/logs/dashboard-modules-detailed.log`
2. Identify missing patterns
3. Update module to include required patterns

### False Positives

1. Pattern terlalu strict? Update regex pattern
2. Naming berbeda? Tambahkan alternative pattern

### Module Not Found

1. Cek struktur folder: `app/dashboard/[module-name]/component/`
2. Cek naming: File harus dimulai dengan `Grid` atau `Form`

## Maintenance

### Adding New Requirements

1. Edit `REQUIRED_GRID_PATTERNS` atau `REQUIRED_FORM_PATTERNS`
2. Set `required: true` untuk mandatory, `false` untuk optional
3. Run test untuk validate

### Updating Patterns

```typescript
{
  pattern: /regex_pattern/,
  name: 'Human readable name',
  required: true
}
```

## Integration with CI/CD

Tambahkan ke pipeline:

```yaml
- name: Run Dashboard Modules Test
  run: npm test __tests__/global/dashboard-modules.test.ts

- name: Upload Test Logs
  uses: actions/upload-artifact@v2
  with:
    name: test-logs
    path: __tests__/logs/
```

## Example Output

```
PASS  __tests__/global/dashboard-modules.test.ts
  Dashboard Modules - Global Validation
    ✓ should find dashboard modules (5 ms)
    Grid Components Validation
      ✓ should validate Grid component for akun-pusat (120 ms)
      ✓ should validate Grid component for kapal (115 ms)
      ✗ should validate Grid component for cabang (98 ms)
    Form Components Validation
      ✓ should validate Form component for akun-pusat (85 ms)
      ✓ should validate Form component for kapal (82 ms)
    API Integration Validation
      ✓ should have API hooks for akun-pusat (45 ms)

Test Suites: 1 failed, 0 passed, 1 total
Tests:       1 failed, 5 passed, 6 total

✓ Logs written to:
  - __tests__/logs/dashboard-modules-test.log
  - __tests__/logs/dashboard-modules-detailed.log
```

## Contributing

Untuk menambahkan validation baru:

1. Tambahkan pattern di configuration
2. Update dokumentasi ini
3. Test dengan `npm test`
4. Commit dengan descriptive message

## Notes

- Test ini bersifat **non-destructive** (hanya membaca file)
- Tidak mengubah atau menghapus source code
- Safe untuk dijalankan di production codebase
- Dapat di-integrate dengan pre-commit hooks
