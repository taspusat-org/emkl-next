# FormKapal Unit Tests

## Overview

Direktori ini berisi comprehensive unit tests dan integration tests untuk komponen FormKapal beserta validasi schema. Testing mencakup berbagai aspek mulai dari rendering, validasi, interaksi user, hingga accessibility.

## Test Files

1. **FormKapal.test.tsx** - Unit tests untuk komponen FormKapal
2. **FormKapal.integration.test.tsx** - Integration tests untuk flow lengkap
3. **kapal.validation.test.ts** - Schema validation tests (di `lib/validations/__tests__/`)

## Test Coverage

### 1. Rendering Tests

- ✅ Render form dengan semua field yang diperlukan
- ✅ Render title yang sesuai berdasarkan mode (add/edit/view/delete)
- ✅ Render button SAVE & ADD hanya di mode add
- ✅ Render button DELETE di mode delete

### 2. Form Validation Tests

- ✅ Validasi field NAMA (required)
- ✅ Validasi field KETERANGAN (required)
- ✅ Validasi field PELAYARAN_ID (required)
- ✅ Validasi field STATUSAKTIF (required)
- ✅ Accept valid form data

### 3. Form Input Interactions

- ✅ Typing di field NAMA
- ✅ Typing di field KETERANGAN
- ✅ Lookup selection untuk Pelayaran
- ✅ Lookup selection untuk Status Aktif
- ✅ Display pre-filled data di edit mode

### 4. Form Modes Tests

- ✅ Add mode: semua input enabled
- ✅ Edit mode: semua input enabled
- ✅ View mode: semua input readonly/disabled
- ✅ Delete mode: semua input readonly/disabled
- ✅ View mode: button save disabled
- ✅ View/Delete mode: lookups disabled

### 5. Button Actions

- ✅ SAVE button memanggil onSubmit dengan parameter false
- ✅ SAVE & ADD button memanggil onSubmit dengan parameter true
- ✅ Cancel button memanggil handleClose
- ✅ Close icon memanggil handleClose dan setPopOver

### 6. Loading States

- ✅ Loading state saat isLoadingCreate = true
- ✅ Loading state saat isLoadingUpdate = true
- ✅ Loading state saat isLoadingDelete = true
- ✅ Buttons disabled selama loading

### 7. Integration Tests

- ✅ Complete form submission flow
- ✅ Prevent submission dengan data tidak lengkap
- ✅ Handle edit mode dengan existing data

### 8. Accessibility Tests

- ✅ Proper labels untuk semua form fields
- ✅ Required indicators pada labels
- ✅ Validation errors accessible (role="alert")

## Cara Menjalankan Test

### Run All Kapal Tests

```bash
npm test kapal
```

### Run Specific Test File

```bash
npm test FormKapal.test.tsx
npm test FormKapal.integration.test.tsx
npm test kapal.validation.test.ts
```

### Run dengan Coverage

```bash
npm test -- --coverage FormKapal
npm test -- --coverage kapal
```

### Run dalam Watch Mode

```bash
npm test -- --watch FormKapal
```

### Run Specific Test Suite

```bash
npm test -- --testNamePattern="Form Validation"
npm test -- --testNamePattern="Complete User Flow"
```

### Run All Tests in Workspace

```bash
npm test
```

### Generate Coverage Report

```bash
npm test -- --coverage --coverageDirectory=coverage
```

## Test Structure

```typescript
describe('FormKapal Component', () => {
  describe('Rendering', () => { ... })
  describe('Form Validation', () => { ... })
  describe('Form Input Interactions', () => { ... })
  describe('Form Modes', () => { ... })
  describe('Button Actions', () => { ... })
  describe('Loading States', () => { ... })
  describe('Integration Tests', () => { ... })
  describe('Accessibility', () => { ... })
})
```

## Mocked Components & Dependencies

### Mocked Components

- `LookUp` - Custom lookup component dimock untuk simplicity

### Mocked Hooks

- `useGetMenu` - Hook untuk mendapatkan menu data

### Test Dependencies

- `@testing-library/react` - Testing utilities
- `@testing-library/user-event` - User interaction simulation
- `react-hook-form` - Form management
- `zod` - Schema validation
- `redux` - State management

## Best Practices Applied

1. **Arrange-Act-Assert Pattern**: Setiap test mengikuti pola AAA
2. **User-Centric Testing**: Test fokus pada behavior user, bukan implementation details
3. **Accessible Queries**: Menggunakan getByRole, getByLabelText, dll
4. **Async Handling**: Proper handling dengan waitFor untuk async operations
5. **Mock Isolation**: Component dependencies di-mock untuk isolation
6. **Descriptive Test Names**: Test names yang jelas menjelaskan apa yang ditest

## Notes

- Test ini menggunakan mock untuk LookUp component karena kompleksitasnya
- Redux store di-configure untuk setiap test case
- FormErrorProvider digunakan untuk context yang diperlukan form
- Test coverage focus pada behavior, bukan implementation

## Test Statistics

### Unit Tests (FormKapal.test.tsx)

- **Total Test Suites**: 8
- **Total Tests**: ~45 test cases
- **Coverage Areas**:
  - Rendering: 5 tests
  - Form Validation: 5 tests
  - Form Input Interactions: 6 tests
  - Form Modes: 6 tests
  - Button Actions: 4 tests
  - Loading States: 4 tests
  - Integration Tests: 3 tests
  - Accessibility: 3 tests

### Integration Tests (FormKapal.integration.test.tsx)

- **Total Test Suites**: 9
- **Total Tests**: ~25 test cases
- **Coverage Areas**:
  - Add Mode Flow: 4 tests
  - Edit Mode Flow: 2 tests
  - View Mode Flow: 2 tests
  - Delete Mode Flow: 2 tests
  - Dialog Controls: 2 tests
  - Loading States: 3 tests
  - Form State Management: 2 tests
  - Error Recovery: 2 tests

### Schema Validation Tests (kapal.validation.test.ts)

- **Total Test Suites**: 9
- **Total Tests**: ~30 test cases
- **Coverage Areas**:
  - Valid Data: 3 tests
  - Invalid NAMA: 2 tests
  - Invalid KETERANGAN: 2 tests
  - Invalid PELAYARAN_ID: 3 tests
  - Invalid STATUSAKTIF: 3 tests
  - Multiple Errors: 2 tests
  - Edge Cases: 5 tests
  - Type Validation: 3 tests
  - Error Messages: 2 tests

**Total Tests**: ~100 test cases across all test files

## Code Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Future Improvements

- [ ] Add E2E tests untuk full user flow dengan Playwright/Cypress
- [ ] Add performance tests untuk form rendering
- [ ] Add snapshot tests untuk UI consistency
- [ ] Add tests untuk keyboard navigation (Tab, Arrow keys)
- [ ] Add tests untuk error boundary scenarios
- [ ] Add visual regression tests
- [ ] Add API mocking tests untuk lookup data
- [ ] Add tests untuk concurrent form submissions
- [ ] Add tests untuk form autosave functionality
