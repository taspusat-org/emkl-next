# FormKapal Testing - Quick Reference

## 🚀 Quick Start

```bash
# Run all tests
npm test kapal

# Run with coverage
npm test -- --coverage kapal

# Watch mode
npm test -- --watch kapal
```

## 📁 Test Files Structure

```
app/dashboard/kapal/components/__tests__/
├── FormKapal.test.tsx              # Unit tests (45 tests)
├── FormKapal.integration.test.tsx  # Integration tests (25 tests)
├── README.md                        # Main documentation
├── TEST_COVERAGE.md                 # Detailed coverage docs
├── test-summary.json                # Test metadata
└── run-tests.bat                    # Helper script

lib/validations/__tests__/
└── kapal.validation.test.ts         # Schema tests (30 tests)
```

## 🎯 What's Tested

### Component Tests

- ✅ Rendering (all modes: add/edit/view/delete)
- ✅ Form validation (all required fields)
- ✅ User interactions (typing, clicking, selecting)
- ✅ Button actions (save, save & add, cancel, close)
- ✅ Loading states (create, update, delete)
- ✅ Accessibility (labels, ARIA, errors)

### Schema Tests

- ✅ Valid data acceptance
- ✅ Invalid data rejection
- ✅ Required fields enforcement
- ✅ Type validation
- ✅ Edge cases (empty, long strings, special chars)
- ✅ Error messages

### Integration Tests

- ✅ Complete user flows
- ✅ Multi-step interactions
- ✅ Error recovery
- ✅ State management

## 📊 Test Statistics

| Category          | Tests   | Status |
| ----------------- | ------- | ------ |
| Unit Tests        | 45      | ✅     |
| Integration Tests | 25      | ✅     |
| Schema Tests      | 30      | ✅     |
| **Total**         | **100** | ✅     |

## 🔍 Common Commands

```bash
# Run specific test file
npm test FormKapal.test.tsx

# Run specific test suite
npm test -- --testNamePattern="Form Validation"

# Run with verbose output
npm test -- --verbose kapal

# Update snapshots (if any)
npm test -- --updateSnapshot kapal

# Run in CI mode
npm test -- --ci --coverage kapal
```

## 📝 Test Categories Quick Reference

### 1. Rendering

```typescript
// Check if component renders
expect(screen.getByText('Tambah Kapal')).toBeInTheDocument();
expect(screen.getByLabelText(/NAMA/i)).toBeInTheDocument();
```

### 2. Validation

```typescript
// Check validation errors
await userEvent.click(screen.getByText('SAVE'));
expect(screen.getByText(/NAMA Harus Diisi/i)).toBeInTheDocument();
```

### 3. User Input

```typescript
// Simulate user typing
await userEvent.type(screen.getByLabelText(/NAMA/i), 'Kapal Test');
expect(screen.getByLabelText(/NAMA/i)).toHaveValue('Kapal Test');
```

### 4. Button Actions

```typescript
// Test button clicks
await userEvent.click(screen.getByText('SAVE'));
expect(mockSubmit).toHaveBeenCalled();
```

### 5. Form Modes

```typescript
// Check readonly in view mode
render(<FormKapalWrapper mode="view" />);
expect(screen.getByLabelText(/NAMA/i)).toHaveAttribute('readonly');
```

## 🐛 Debugging Tests

### Enable Debug Output

```typescript
import { screen } from '@testing-library/react';

// Print component tree
screen.debug();

// Print specific element
screen.debug(screen.getByLabelText(/NAMA/i));
```

### Check What's Rendered

```typescript
// List all elements with specific role
screen.getAllByRole('textbox').forEach((el) => console.log(el));

// Find by text content
screen.getByText(/text/i, { exact: false });
```

### Wait for Async Operations

```typescript
await waitFor(
  () => {
    expect(screen.getByText('Success')).toBeInTheDocument();
  },
  { timeout: 3000 }
);
```

## 🎨 Test Data Templates

### Valid Data

```typescript
const validData = {
  nama: 'Kapal Test',
  keterangan: 'Keterangan Test',
  pelayaran_id: 1,
  statusaktif: 1
};
```

### Invalid Data (for error testing)

```typescript
const invalidData = {
  nama: '', // empty - will fail
  keterangan: '', // empty - will fail
  pelayaran_id: 0, // 0 - will fail
  statusaktif: 0 // 0 - will fail
};
```

## ⚡ Performance Tips

1. **Run tests in parallel** - Jest does this by default
2. **Use test.skip()** for temporarily disabling tests
3. **Mock heavy components** - Already done for LookUp
4. **Use beforeEach() for common setup** - Reduces duplication

## 🔒 Coverage Requirements

```json
{
  "statements": 80,
  "branches": 75,
  "functions": 80,
  "lines": 80
}
```

Check coverage:

```bash
npm test -- --coverage kapal
```

View HTML report:

```bash
# Coverage report at: coverage/lcov-report/index.html
start coverage/lcov-report/index.html
```

## 🚨 Common Issues & Fixes

### Issue: Test timeout

```typescript
// Fix: Increase timeout
jest.setTimeout(10000);
```

### Issue: Element not found

```typescript
// Fix: Use waitFor
await waitFor(() => {
  expect(screen.getByText('...')).toBeInTheDocument();
});
```

### Issue: Mock not working

```typescript
// Fix: Check mock path matches import
jest.mock('@/components/custom-ui/LookUp', () => {...});
```

### Issue: Redux state not updating

```typescript
// Fix: Ensure store is properly configured
const store = createMockStore({ lookup: {...} });
```

## 📚 Additional Resources

- Full docs: `README.md`
- Coverage details: `TEST_COVERAGE.md`
- Test metadata: `test-summary.json`
- Run helper: `run-tests.bat`

## 🎓 Learning Path

1. **Start with** `FormKapal.test.tsx` - Basic unit tests
2. **Then review** `kapal.validation.test.ts` - Schema validation
3. **Finally study** `FormKapal.integration.test.tsx` - Complex flows

## ✅ Pre-Commit Checklist

- [ ] All tests passing: `npm test kapal`
- [ ] Coverage > 80%: `npm test -- --coverage kapal`
- [ ] No console errors
- [ ] Documentation updated if needed
- [ ] New tests added for new features

---

**Quick Help**: For detailed information, see `README.md` or `TEST_COVERAGE.md`
