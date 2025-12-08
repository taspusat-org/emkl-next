# Global Dashboard Test - Quick Start Guide

## 🚀 Quick Start

### 1. Install Dependencies (jika belum)

```bash
npm install
```

### 2. Run Test

```bash
npm run test:global
```

### 3. View Results

Setelah test selesai, cek log files di:

- `__tests__/logs/dashboard-modules-test.log` - Summary
- `__tests__/logs/dashboard-modules-detailed.log` - Detailed logs

---

## 📋 Available Commands

| Command                        | Description                     |
| ------------------------------ | ------------------------------- |
| `npm run test:global`          | Run test sekali                 |
| `npm run test:global:watch`    | Run test dalam watch mode       |
| `npm run test:global:coverage` | Run test dengan coverage report |
| `npm run test:global:verbose`  | Run test dengan output verbose  |

---

## 📊 Understanding Test Results

### Terminal Output

```bash
PASS  __tests__/global/dashboard-modules.test.ts
  Dashboard Modules - Global Validation
    ✓ should find dashboard modules (5 ms)
    Grid Components Validation
      ✓ should validate Grid component for akun-pusat (120 ms)
      ✓ should validate Grid component for kapal (115 ms)
      ✗ should validate Grid component for cabang (98 ms)
```

### Log Files

#### Summary Log (`dashboard-modules-test.log`)

```
========================================
DASHBOARD MODULES TEST SUMMARY
========================================
Test Duration: 2.34s
Total Logs: 245
✓ Success: 189
⚠ Warnings: 23
✗ Errors: 33
========================================

[timestamp] [SUCCESS] ✓ akun-pusat: PASSED
[timestamp] [ERROR] ✗ kapal: FAILED (Grid: FAIL, Form: PASS)
```

#### Detailed Log (`dashboard-modules-detailed.log`)

```
[timestamp] akun-pusat - Grid - States - PASS: rows state
[timestamp] akun-pusat - Grid - States - PASS: selectedRow state
[timestamp] kapal - Grid - Functions - FAIL: handleScroll (required)
```

---

## 🔍 Interpreting Results

### ✅ **PASSED** - Module sempurna

- Semua required patterns ditemukan
- Tidak ada critical errors
- Module mengikuti best practices

### ⚠️ **WARNINGS** - Module OK tapi bisa diperbaiki

- Beberapa optional patterns tidak ditemukan
- Module masih functional
- Recommended untuk diperbaiki

### ❌ **FAILED** - Module perlu diperbaiki

- Required patterns tidak ditemukan
- Module tidak memenuhi standar minimum
- **HARUS diperbaiki**

---

## 🛠️ Fixing Errors

### Step 1: Identify Error

Buka `dashboard-modules-detailed.log` dan cari module yang error:

```
[timestamp] kapal - Grid - Functions - FAIL: handleScroll (required)
```

### Step 2: Check Module File

Buka file Grid component:

```
app/dashboard/kapal/component/GridKapal.tsx
```

### Step 3: Add Missing Pattern

Tambahkan function yang missing:

```typescript
async function handleScroll(event: React.UIEvent<HTMLDivElement>) {
  // Infinite scroll implementation
  if (isAtBottom(event) && hasMore) {
    setCurrentPage((prev) => prev + 1);
  }
}
```

### Step 4: Re-run Test

```bash
npm run test:global
```

---

## 📝 Common Issues & Solutions

### Issue: "No Grid component found"

**Solution**: Pastikan file Grid ada di:

```
app/dashboard/[module-name]/component/Grid[ModuleName].tsx
```

### Issue: "handleScroll missing"

**Solution**: Tambahkan infinite scroll function:

```typescript
async function handleScroll(event: React.UIEvent<HTMLDivElement>) {
  if (isAtBottom(event) && hasMore) {
    setCurrentPage((prev) => prev + 1);
  }
}
```

### Issue: "CRUD hooks missing"

**Solution**: Pastikan semua hooks ada:

```typescript
const { data } = useGetXxx();
const { mutateAsync: createXxx } = useCreateXxx();
const { mutateAsync: updateXxx } = useUpdateXxx();
const { mutateAsync: deleteXxx } = useDeleteXxx();
```

### Issue: "Form validation missing"

**Solution**: Tambahkan zod resolver:

```typescript
const forms = useForm<XxxInput>({
  resolver: zodResolver(XxxSchema)
  // ...
});
```

---

## 🎯 Best Practices Checklist

### Grid Component

- [ ] State: `rows`, `selectedRow`, `filters`, `currentPage`
- [ ] Ref: `gridRef` (DataGridHandle)
- [ ] Hooks: GET, CREATE, UPDATE, DELETE
- [ ] Functions: `handleAdd`, `handleEdit`, `handleDelete`, `handleScroll`, `onSubmit`
- [ ] Grid: `columns`, `<DataGrid>`, `rowKeyGetter`
- [ ] Form: `useForm`, `zodResolver`

### Form Component

- [ ] Props: `mode`, `forms`, `popOver`, `onSubmit`
- [ ] Components: `<FormField>`, `<FormControl>`
- [ ] Buttons: Submit, Cancel/Close
- [ ] Validation: Zod schema integration

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Dashboard Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run global tests
        run: npm run test:global
      - name: Upload logs
        uses: actions/upload-artifact@v2
        with:
          name: test-logs
          path: __tests__/logs/
```

---

## 📚 Additional Resources

- [Full Documentation](./README.md)
- [Test File](./__tests__/global/dashboard-modules.test.ts)
- [Example Logs](./__tests__/logs/dashboard-modules-test.example.log)

---

## 💡 Tips

1. **Run sebelum commit**: Pastikan semua module PASS
2. **Check logs regular**: Monitor warnings untuk improvement
3. **Update patterns**: Sesuaikan dengan standard baru jika diperlukan
4. **CI/CD integration**: Automate test di pipeline

---

## 🆘 Need Help?

1. Check detailed logs di `__tests__/logs/`
2. Read full documentation di `__tests__/global/README.md`
3. Review example output di `__tests__/logs/dashboard-modules-test.example.log`
4. Contact team untuk assistance

---

**Happy Testing! 🎉**
