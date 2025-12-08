# Test Coverage Documentation

## FormKapal Component Testing

### Component Overview

FormKapal adalah komponen form dialog untuk mengelola data kapal dengan mode: Add, Edit, View, dan Delete.

### Fields yang Ditest

1. **NAMA** (required, string)
2. **KETERANGAN** (required, string)
3. **PELAYARAN** (required, number via lookup)
4. **STATUS AKTIF** (required, number via lookup)

---

## Test Categories

### 1. Rendering Tests

**Tujuan**: Memastikan komponen render dengan benar

#### Test Cases:

- ✅ Render form dengan semua field required
- ✅ Render title sesuai mode (Tambah/Edit/Delete/View Kapal)
- ✅ Render button SAVE & ADD hanya di mode add
- ✅ Render button DELETE di mode delete

**Expected Behavior**:

- Semua input field muncul
- Label dan required indicators tampil
- Buttons sesuai dengan mode yang dipilih

---

### 2. Form Validation Tests

**Tujuan**: Memastikan validasi form bekerja dengan benar

#### Test Cases:

- ✅ Validasi NAMA tidak boleh kosong
- ✅ Validasi KETERANGAN tidak boleh kosong
- ✅ Validasi PELAYARAN_ID harus > 0
- ✅ Validasi STATUSAKTIF harus > 0
- ✅ Accept form dengan data valid lengkap

**Expected Behavior**:

- Error message muncul saat field kosong
- Error message muncul saat value tidak valid
- Form submit berhasil dengan data valid
- Error message hilang saat field diisi dengan benar

**Error Messages**:

```
- "NAMA Harus Diisi"
- "KETERANGAN Harus Diisi"
- "PELAYARAN Harus Diisi"
- "STATUSAKTIF Harus Diisi"
```

---

### 3. Form Input Interactions

**Tujuan**: Memastikan user dapat berinteraksi dengan form

#### Test Cases:

- ✅ User dapat mengetik di field NAMA
- ✅ User dapat mengetik di field KETERANGAN
- ✅ User dapat memilih Pelayaran via lookup
- ✅ User dapat memilih Status Aktif via lookup
- ✅ Data ter-populate dengan benar di edit mode

**Expected Behavior**:

- Input text fields responsive terhadap keyboard input
- Lookup buttons berfungsi dan mengupdate hidden fields
- Pre-filled data muncul saat edit mode

---

### 4. Form Modes Tests

**Tujuan**: Memastikan behavior berbeda untuk setiap mode

#### Add Mode:

- ✅ Semua input enabled
- ✅ Button SAVE ada
- ✅ Button SAVE & ADD ada
- ✅ Lookups enabled

#### Edit Mode:

- ✅ Semua input enabled
- ✅ Button SAVE ada
- ✅ Button SAVE & ADD tidak ada
- ✅ Data existing ter-load
- ✅ Lookups enabled

#### View Mode:

- ✅ Semua input readonly/disabled
- ✅ Button SAVE disabled
- ✅ Lookups disabled
- ✅ Data ditampilkan tapi tidak bisa diubah

#### Delete Mode:

- ✅ Semua input readonly/disabled
- ✅ Button DELETE ada (bukan SAVE)
- ✅ Lookups disabled
- ✅ Data ditampilkan untuk konfirmasi delete

---

### 5. Button Actions Tests

**Tujuan**: Memastikan semua buttons berfungsi dengan benar

#### Test Cases:

- ✅ SAVE button memanggil onSubmit(false)
- ✅ SAVE & ADD button memanggil onSubmit(true)
- ✅ Cancel button memanggil handleClose
- ✅ Close icon (X) memanggil handleClose dan setPopOver(false)

**Expected Behavior**:

- Callback functions dipanggil dengan parameter yang benar
- Dialog tertutup saat Cancel/Close
- Form submit dengan flag yang sesuai

---

### 6. Loading States Tests

**Tujuan**: Memastikan loading indicators berfungsi

#### Test Cases:

- ✅ Loading saat isLoadingCreate = true
- ✅ Loading saat isLoadingUpdate = true
- ✅ Loading saat isLoadingDelete = true
- ✅ Buttons disabled selama loading

**Expected Behavior**:

- Button menampilkan loading indicator
- User tidak dapat spam-click button
- Loading state per operation type

---

### 7. Integration Tests

**Tujuan**: Memastikan full user flow berjalan end-to-end

#### Complete Add Flow:

1. User membuka form add
2. User mengisi NAMA
3. User mengisi KETERANGAN
4. User memilih Pelayaran via lookup
5. User memilih Status Aktif via lookup
6. User click SAVE
7. onSubmit dipanggil dengan data lengkap

#### Save & Add Flow:

- Sama seperti add flow tapi click SAVE & ADD
- onSubmit dipanggil dengan parameter true

#### Incomplete Submission:

- User hanya mengisi sebagian field
- Validation errors muncul
- onSubmit tidak dipanggil

#### Edit Flow:

1. Form load dengan data existing
2. User modify beberapa field
3. User click SAVE
4. onSubmit dipanggil dengan data updated

---

### 8. Accessibility Tests

**Tujuan**: Memastikan form accessible untuk semua user

#### Test Cases:

- ✅ Semua field punya proper labels
- ✅ Required indicators ada pada labels
- ✅ Error messages accessible (role="alert")

**ARIA & Semantic HTML**:

- Input fields ter-associate dengan labels
- Error messages dengan role alert
- Focus management yang proper

---

## Schema Validation Tests

### Valid Data Tests

- ✅ Complete valid data accepted
- ✅ Optional fields dapat null
- ✅ Data minimal valid accepted

### Invalid Data Tests

#### NAMA Field:

- ❌ Empty string rejected
- ❌ Missing field rejected
- ❌ Non-string type rejected

#### KETERANGAN Field:

- ❌ Empty string rejected
- ❌ Missing field rejected
- ❌ Non-string type rejected

#### PELAYARAN_ID Field:

- ❌ Value 0 rejected
- ❌ Negative value rejected
- ❌ Missing field rejected
- ❌ Non-number type rejected

#### STATUSAKTIF Field:

- ❌ Value 0 rejected
- ❌ Negative value rejected
- ❌ Missing field rejected
- ❌ Non-number type rejected

### Edge Cases Tests

- ✅ Minimum valid values accepted (1 character, value 1)
- ✅ Very long strings accepted
- ✅ Large number values accepted
- ✅ Special characters accepted
- ✅ Unicode characters accepted

---

## Integration Flow Tests

### Complete User Flows

#### Scenario 1: Successful Add

```
Given: User opens form in add mode
When: User fills all required fields
And: User clicks SAVE
Then: Form validates successfully
And: onSubmit is called with data
And: No validation errors shown
```

#### Scenario 2: Incomplete Add

```
Given: User opens form in add mode
When: User fills only NAMA field
And: User clicks SAVE
Then: Validation errors appear for missing fields
And: onSubmit is NOT called
And: Form remains open
```

#### Scenario 3: Save & Add

```
Given: User opens form in add mode
When: User fills all required fields
And: User clicks SAVE & ADD
Then: Form validates successfully
And: onSubmit is called with true parameter
```

#### Scenario 4: Edit Existing Data

```
Given: Form opens in edit mode with existing data
When: User modifies NAMA field
And: User clicks SAVE
Then: Form validates successfully
And: onSubmit is called with updated data
```

#### Scenario 5: View Read-Only

```
Given: Form opens in view mode
Then: All fields are readonly
And: SAVE button is disabled
And: Lookups are disabled
And: User cannot modify any data
```

#### Scenario 6: Delete Confirmation

```
Given: Form opens in delete mode with data
When: User reviews the data
And: User clicks DELETE
Then: onSubmit is called
And: Data is sent for deletion
```

#### Scenario 7: Cancel Operation

```
Given: Form is open in any mode
When: User clicks Cancel
Then: handleClose is called
And: Form closes without submitting
```

#### Scenario 8: Error Recovery

```
Given: Form shows validation errors
When: User corrects the invalid fields
Then: Error messages disappear progressively
And: Form becomes valid
```

---

## Test Data Examples

### Valid Test Data

```typescript
{
  id: 1,
  nama: "Kapal Cargo Express",
  keterangan: "Kapal cargo untuk ekspor impor barang",
  pelayaran_id: 1,
  pelayaran: "PT Pelayaran Indonesia",
  statusaktif: 1,
  statusaktif_nama: "AKTIF"
}
```

### Invalid Test Data Examples

```typescript
// Missing required fields
{
  nama: "Kapal Test"
  // keterangan, pelayaran_id, statusaktif missing
}

// Invalid field values
{
  nama: "",  // empty
  keterangan: "",  // empty
  pelayaran_id: 0,  // must be > 0
  statusaktif: 0  // must be > 0
}
```

---

## Performance Considerations

### Test Execution Time

- Unit tests: ~5-10 seconds
- Integration tests: ~10-15 seconds
- Validation tests: ~3-5 seconds
- **Total**: ~20-30 seconds for complete suite

### Optimization Tips

1. Run tests in parallel when possible
2. Use mock components untuk dependencies
3. Minimize API calls dalam tests
4. Use test data factories untuk data generation

---

## Maintenance Guidelines

### When to Update Tests

1. **Component Changes**:

   - Field ditambah/dihapus → update rendering tests
   - Validation rule berubah → update validation tests
   - Mode behavior berubah → update mode tests

2. **Schema Changes**:

   - Field baru → add validation tests
   - Validation rule baru → update schema tests
   - Type changes → update type tests

3. **UI Changes**:
   - Button labels berubah → update button tests
   - Error messages berubah → update validation tests
   - Layout changes → verify accessibility tests

### Test Maintenance Checklist

- [ ] Update test data saat schema berubah
- [ ] Update mock components saat dependencies berubah
- [ ] Update assertions saat behavior berubah
- [ ] Verify coverage tetap > 80%
- [ ] Run full test suite sebelum commit
- [ ] Update documentation bila diperlukan

---

## Troubleshooting

### Common Test Failures

#### "Element not found"

- Cause: Query selector tidak cocok
- Fix: Verify label/text masih sama di component

#### "Timeout waiting for element"

- Cause: Async operation tidak di-await
- Fix: Use `waitFor()` untuk async operations

#### "Mock not working"

- Cause: Mock path tidak benar
- Fix: Verify import path sama dengan di component

#### "Validation not triggered"

- Cause: Form mode validation tidak aktif
- Fix: Set `mode: 'onChange'` di useForm

---

## Coverage Reports

### How to Generate

```bash
npm test -- --coverage kapal
```

### Report Locations

- HTML Report: `coverage/lcov-report/index.html`
- JSON Report: `coverage/coverage-final.json`
- LCOV Report: `coverage/lcov.info`

### Coverage Thresholds

```json
{
  "global": {
    "statements": 80,
    "branches": 75,
    "functions": 80,
    "lines": 80
  }
}
```

---

## Best Practices Applied

1. **AAA Pattern**: Arrange-Act-Assert
2. **User-Centric**: Test behavior, not implementation
3. **Accessibility First**: Use semantic queries
4. **Isolated Tests**: Each test independent
5. **Clear Names**: Descriptive test names
6. **Proper Mocking**: Mock external dependencies
7. **Async Handling**: Proper waitFor usage
8. **Error Cases**: Test both success and failure

---

## References

- [Testing Library Docs](https://testing-library.com/)
- [Jest Documentation](https://jestjs.io/)
- [React Hook Form Testing](https://react-hook-form.com/advanced-usage#TestingForm)
- [Zod Validation](https://zod.dev/)

---

**Last Updated**: November 21, 2025
**Test Suite Version**: 1.0.0
**Component Version**: Latest
