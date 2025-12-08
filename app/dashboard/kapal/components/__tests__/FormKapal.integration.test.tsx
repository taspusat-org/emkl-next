import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormKapal from '../FormKapal';
import { kapalSchema, KapalInput } from '@/lib/validations/kapal.validation';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import lookupReducer from '@/lib/store/lookupSlice/lookupSlice';
import { FormErrorProvider } from '@/lib/hooks/formErrorContext';

// Mock LookUp component
jest.mock('@/components/custom-ui/LookUp', () => {
  return function MockLookUp({
    lookupValue,
    lookupNama,
    inputLookupValue,
    disabled,
    label
  }: any) {
    return (
      <div data-testid={`lookup-${label}`}>
        <input
          type="text"
          data-testid={`lookup-input-${label}`}
          value={lookupNama || ''}
          readOnly
          disabled={disabled}
        />
        <input
          type="hidden"
          data-testid={`lookup-value-${label}`}
          value={inputLookupValue || ''}
        />
        <button
          data-testid={`lookup-button-${label}`}
          onClick={() => lookupValue && lookupValue(1)}
          disabled={disabled}
        >
          Select {label}
        </button>
      </div>
    );
  };
});

jest.mock('@/lib/server/useMenu', () => ({
  useGetMenu: jest.fn(() => ({ data: [] }))
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      lookup: lookupReducer
    },
    preloadedState: initialState
  });
};

const FormKapalWrapper = ({
  mode = 'add',
  defaultValues = {},
  onSubmit = jest.fn(),
  handleClose = jest.fn(),
  isLoadingCreate = false,
  isLoadingUpdate = false,
  isLoadingDelete = false,
  popOver = true,
  setPopOver = jest.fn()
}: any) => {
  const forms = useForm<KapalInput>({
    resolver: zodResolver(kapalSchema),
    defaultValues: {
      nama: '',
      keterangan: '',
      pelayaran_id: 0,
      statusaktif: 0,
      ...defaultValues
    },
    mode: 'onChange'
  });

  const store = createMockStore({
    lookup: {
      openName: '',
      data: {},
      type: {},
      default: {},
      submitClicked: false,
      isLookupOpen: false,
      clearLookup: false
    }
  });

  return (
    <Provider store={store}>
      <FormErrorProvider>
        <FormKapal
          forms={forms}
          onSubmit={onSubmit}
          mode={mode}
          handleClose={handleClose}
          isLoadingCreate={isLoadingCreate}
          isLoadingUpdate={isLoadingUpdate}
          isLoadingDelete={isLoadingDelete}
          popOver={popOver}
          setPopOver={setPopOver}
        />
      </FormErrorProvider>
    </Provider>
  );
};

describe('FormKapal Integration Tests', () => {
  describe('Complete User Flow - Add Mode', () => {
    test('should complete successful form submission with all fields filled', async () => {
      const mockSubmit = jest.fn();
      render(<FormKapalWrapper onSubmit={mockSubmit} />);

      // Step 1: Fill NAMA field
      const namaInput = screen.getByLabelText(/NAMA/i);
      await userEvent.type(namaInput, 'Kapal Cargo Express');
      expect(namaInput).toHaveValue('Kapal Cargo Express');

      // Step 2: Fill KETERANGAN field
      const keteranganInput = screen.getByLabelText(/Keterangan/i);
      await userEvent.type(keteranganInput, 'Kapal cargo untuk ekspor impor');
      expect(keteranganInput).toHaveValue('Kapal cargo untuk ekspor impor');

      // Step 3: Select Pelayaran via lookup
      const pelayaranButton = screen.getByTestId('lookup-button-PELAYARAN');
      await userEvent.click(pelayaranButton);

      await waitFor(() => {
        const hiddenInput = screen.getByTestId('lookup-value-PELAYARAN');
        expect(hiddenInput).toHaveValue('1');
      });

      // Step 4: Select Status Aktif via lookup
      const statusAktifButton = screen.getByTestId(
        'lookup-button-STATUS AKTIF'
      );
      await userEvent.click(statusAktifButton);

      await waitFor(() => {
        const hiddenInput = screen.getByTestId('lookup-value-STATUS AKTIF');
        expect(hiddenInput).toHaveValue('1');
      });

      // Step 5: Submit form
      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      // Verify submission
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(false);
      });
    });

    test('should complete save and add flow', async () => {
      const mockSubmit = jest.fn();
      render(<FormKapalWrapper onSubmit={mockSubmit} mode="add" />);

      // Fill all required fields
      await userEvent.type(screen.getByLabelText(/NAMA/i), 'Kapal Test');
      await userEvent.type(
        screen.getByLabelText(/Keterangan/i),
        'Keterangan Test'
      );
      await userEvent.click(screen.getByTestId('lookup-button-PELAYARAN'));
      await userEvent.click(screen.getByTestId('lookup-button-STATUS AKTIF'));

      // Click SAVE & ADD button
      const saveAndAddButton = screen.getByText('SAVE & ADD');
      await userEvent.click(saveAndAddButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(true);
      });
    });

    test('should prevent submission when form is incomplete', async () => {
      const mockSubmit = jest.fn();
      render(<FormKapalWrapper onSubmit={mockSubmit} />);

      // Only fill NAMA field
      await userEvent.type(screen.getByLabelText(/NAMA/i), 'Kapal Incomplete');

      // Try to submit
      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/KETERANGAN Harus Diisi/i)).toBeInTheDocument();
        expect(screen.getByText(/PELAYARAN Harus Diisi/i)).toBeInTheDocument();
        expect(
          screen.getByText(/STATUSAKTIF Harus Diisi/i)
        ).toBeInTheDocument();
      });

      // Should not call submit
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    test('should show validation errors for all empty fields', async () => {
      const mockSubmit = jest.fn();
      render(<FormKapalWrapper onSubmit={mockSubmit} />);

      // Submit empty form
      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      // All validation errors should be displayed
      await waitFor(() => {
        expect(screen.getByText(/NAMA Harus Diisi/i)).toBeInTheDocument();
        expect(screen.getByText(/KETERANGAN Harus Diisi/i)).toBeInTheDocument();
        expect(screen.getByText(/PELAYARAN Harus Diisi/i)).toBeInTheDocument();
        expect(
          screen.getByText(/STATUSAKTIF Harus Diisi/i)
        ).toBeInTheDocument();
      });

      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Complete User Flow - Edit Mode', () => {
    test('should load and modify existing data', async () => {
      const mockSubmit = jest.fn();
      const existingData: Partial<KapalInput> = {
        id: 1,
        nama: 'Kapal Original',
        keterangan: 'Keterangan Original',
        pelayaran_id: 1,
        pelayaran: 'Pelayaran A',
        statusaktif: 1,
        statusaktif_nama: 'AKTIF'
      };

      render(
        <FormKapalWrapper
          mode="edit"
          defaultValues={existingData}
          onSubmit={mockSubmit}
        />
      );

      // Verify data is loaded
      expect(screen.getByText('Edit Kapal')).toBeInTheDocument();
      const namaInput = screen.getByLabelText(/NAMA/i) as HTMLInputElement;
      expect(namaInput.value).toBe('Kapal Original');

      // Modify NAMA field
      await userEvent.clear(namaInput);
      await userEvent.type(namaInput, 'Kapal Modified');
      expect(namaInput.value).toBe('Kapal Modified');

      // Modify KETERANGAN field
      const keteranganInput = screen.getByLabelText(
        /Keterangan/i
      ) as HTMLInputElement;
      await userEvent.clear(keteranganInput);
      await userEvent.type(keteranganInput, 'Keterangan Modified');
      expect(keteranganInput.value).toBe('Keterangan Modified');

      // Submit modified form
      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(false);
      });
    });

    test('should not allow clearing required fields in edit mode', async () => {
      const mockSubmit = jest.fn();
      const existingData: Partial<KapalInput> = {
        id: 1,
        nama: 'Kapal Original',
        keterangan: 'Keterangan Original',
        pelayaran_id: 1,
        statusaktif: 1
      };

      render(
        <FormKapalWrapper
          mode="edit"
          defaultValues={existingData}
          onSubmit={mockSubmit}
        />
      );

      // Clear NAMA field
      const namaInput = screen.getByLabelText(/NAMA/i);
      await userEvent.clear(namaInput);

      // Try to submit
      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/NAMA Harus Diisi/i)).toBeInTheDocument();
      });

      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Complete User Flow - View Mode', () => {
    test('should display data in read-only mode', () => {
      const viewData: Partial<KapalInput> = {
        id: 1,
        nama: 'Kapal View',
        keterangan: 'Keterangan View',
        pelayaran_id: 1,
        pelayaran: 'Pelayaran View',
        statusaktif: 1,
        statusaktif_nama: 'AKTIF'
      };

      render(<FormKapalWrapper mode="view" defaultValues={viewData} />);

      // Verify title
      expect(screen.getByText('View Kapal')).toBeInTheDocument();

      // Verify all fields are readonly
      const namaInput = screen.getByLabelText(/NAMA/i);
      const keteranganInput = screen.getByLabelText(/Keterangan/i);

      expect(namaInput).toHaveAttribute('readonly');
      expect(keteranganInput).toHaveAttribute('readonly');

      // Verify save button is disabled
      const saveButton = screen.getByText('SAVE');
      expect(saveButton).toBeDisabled();

      // Verify lookups are disabled
      const pelayaranButton = screen.getByTestId('lookup-button-PELAYARAN');
      const statusAktifButton = screen.getByTestId(
        'lookup-button-STATUS AKTIF'
      );
      expect(pelayaranButton).toBeDisabled();
      expect(statusAktifButton).toBeDisabled();
    });

    test('should not allow any modifications in view mode', async () => {
      const viewData: Partial<KapalInput> = {
        id: 1,
        nama: 'Kapal View',
        keterangan: 'Keterangan View',
        pelayaran_id: 1,
        statusaktif: 1
      };

      render(<FormKapalWrapper mode="view" defaultValues={viewData} />);

      const namaInput = screen.getByLabelText(/NAMA/i) as HTMLInputElement;
      const originalValue = namaInput.value;

      // Try to type (should not work due to readonly)
      await userEvent.type(namaInput, 'New Text');

      // Value should remain unchanged
      expect(namaInput.value).toBe(originalValue);
    });
  });

  describe('Complete User Flow - Delete Mode', () => {
    test('should display data with delete confirmation', () => {
      const deleteData: Partial<KapalInput> = {
        id: 1,
        nama: 'Kapal To Delete',
        keterangan: 'Keterangan To Delete',
        pelayaran_id: 1,
        statusaktif: 1
      };

      render(<FormKapalWrapper mode="delete" defaultValues={deleteData} />);

      // Verify title
      expect(screen.getByText('Delete Kapal')).toBeInTheDocument();

      // Verify all fields are readonly
      const namaInput = screen.getByLabelText(/NAMA/i);
      expect(namaInput).toHaveAttribute('readonly');
      expect(namaInput).toHaveValue('Kapal To Delete');

      // Verify delete button exists
      const deleteButtons = screen.getAllByText('DELETE');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    test('should execute delete action', async () => {
      const mockSubmit = jest.fn();
      const deleteData: Partial<KapalInput> = {
        id: 1,
        nama: 'Kapal To Delete',
        keterangan: 'Keterangan To Delete',
        pelayaran_id: 1,
        statusaktif: 1
      };

      render(
        <FormKapalWrapper
          mode="delete"
          defaultValues={deleteData}
          onSubmit={mockSubmit}
        />
      );

      // Click delete button
      const deleteButton = screen.getAllByText('DELETE')[0];
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Dialog Controls', () => {
    test('should close dialog via cancel button', async () => {
      const mockHandleClose = jest.fn();
      render(<FormKapalWrapper handleClose={mockHandleClose} />);

      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      expect(mockHandleClose).toHaveBeenCalled();
    });

    test('should close dialog via close icon', async () => {
      const mockHandleClose = jest.fn();
      const mockSetPopOver = jest.fn();

      render(
        <FormKapalWrapper
          handleClose={mockHandleClose}
          setPopOver={mockSetPopOver}
        />
      );

      const closeButton = screen
        .getByText('Tambah Kapal')
        .parentElement?.querySelector('div[class*="cursor-pointer"]');

      if (closeButton) {
        await userEvent.click(closeButton);
      }

      expect(mockSetPopOver).toHaveBeenCalledWith(false);
      expect(mockHandleClose).toHaveBeenCalled();
    });
  });

  describe('Loading States During Submission', () => {
    test('should show loading state during create', async () => {
      const mockSubmit = jest.fn();
      const { rerender } = render(
        <FormKapalWrapper onSubmit={mockSubmit} isLoadingCreate={false} />
      );

      // Fill form
      await userEvent.type(screen.getByLabelText(/NAMA/i), 'Kapal Test');
      await userEvent.type(
        screen.getByLabelText(/Keterangan/i),
        'Keterangan Test'
      );
      await userEvent.click(screen.getByTestId('lookup-button-PELAYARAN'));
      await userEvent.click(screen.getByTestId('lookup-button-STATUS AKTIF'));

      // Simulate loading state
      rerender(
        <FormKapalWrapper onSubmit={mockSubmit} isLoadingCreate={true} />
      );

      const saveButton = screen.getByText('SAVE');
      expect(saveButton).toHaveAttribute('loading');
    });

    test('should show loading state during update', () => {
      render(<FormKapalWrapper mode="edit" isLoadingUpdate={true} />);

      const saveButton = screen.getByText('SAVE');
      expect(saveButton).toHaveAttribute('loading');
    });

    test('should show loading state during delete', () => {
      render(<FormKapalWrapper mode="delete" isLoadingDelete={true} />);

      const deleteButtons = screen.getAllByText('DELETE');
      expect(deleteButtons[0]).toHaveAttribute('loading');
    });
  });

  describe('Form Reset and State Management', () => {
    test('should maintain form state when switching between fields', async () => {
      render(<FormKapalWrapper />);

      // Fill NAMA
      const namaInput = screen.getByLabelText(/NAMA/i);
      await userEvent.type(namaInput, 'Kapal Test');

      // Fill KETERANGAN
      const keteranganInput = screen.getByLabelText(/Keterangan/i);
      await userEvent.type(keteranganInput, 'Keterangan Test');

      // Go back to NAMA and verify value is still there
      await userEvent.click(namaInput);
      expect(namaInput).toHaveValue('Kapal Test');
      expect(keteranganInput).toHaveValue('Keterangan Test');
    });

    test('should handle rapid field updates', async () => {
      render(<FormKapalWrapper />);

      const namaInput = screen.getByLabelText(/NAMA/i);

      // Type quickly
      await userEvent.type(namaInput, 'Quick');
      await userEvent.type(namaInput, 'Test');
      await userEvent.type(namaInput, 'Input');

      expect(namaInput).toHaveValue('QuickTestInput');
    });
  });

  describe('Error Recovery', () => {
    test('should clear validation errors when valid data is entered', async () => {
      const mockSubmit = jest.fn();
      render(<FormKapalWrapper onSubmit={mockSubmit} />);

      // Submit empty form to trigger errors
      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      // Verify errors are shown
      await waitFor(() => {
        expect(screen.getByText(/NAMA Harus Diisi/i)).toBeInTheDocument();
      });

      // Fill NAMA field
      const namaInput = screen.getByLabelText(/NAMA/i);
      await userEvent.type(namaInput, 'Kapal Valid');

      // NAMA error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/NAMA Harus Diisi/i)).not.toBeInTheDocument();
      });
    });

    test('should handle validation errors sequentially', async () => {
      const mockSubmit = jest.fn();
      render(<FormKapalWrapper onSubmit={mockSubmit} />);

      // Submit to get all errors
      await userEvent.click(screen.getByText('SAVE'));

      await waitFor(() => {
        expect(screen.getByText(/NAMA Harus Diisi/i)).toBeInTheDocument();
        expect(screen.getByText(/KETERANGAN Harus Diisi/i)).toBeInTheDocument();
      });

      // Fix fields one by one
      await userEvent.type(screen.getByLabelText(/NAMA/i), 'Kapal Test');
      await waitFor(() => {
        expect(screen.queryByText(/NAMA Harus Diisi/i)).not.toBeInTheDocument();
      });

      await userEvent.type(
        screen.getByLabelText(/Keterangan/i),
        'Keterangan Test'
      );
      await waitFor(() => {
        expect(
          screen.queryByText(/KETERANGAN Harus Diisi/i)
        ).not.toBeInTheDocument();
      });
    });
  });
});
