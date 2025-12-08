import '@testing-library/jest-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormKapal from '../FormKapal';
import { kapalSchema, KapalInput } from '@/lib/validations/kapal.validation';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import lookupReducer from '@/lib/store/lookupSlice/lookupSlice';
import { FormErrorProvider } from '@/lib/hooks/formErrorContext';

// Mock components yang kompleks
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

// Mock hooks
jest.mock('@/lib/server/useMenu', () => ({
  useGetMenu: jest.fn(() => ({ data: [] }))
}));

// Helper function untuk membuat mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      lookup: lookupReducer
    },
    preloadedState: initialState
  });
};

// Wrapper component untuk testing dengan form
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

describe('FormKapal Component', () => {
  describe('Rendering', () => {
    test('should render form with all required fields', () => {
      render(<FormKapalWrapper />);

      expect(screen.getByText('Tambah Kapal')).toBeInTheDocument();
      expect(screen.getByLabelText(/NAMA/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Keterangan/i)).toBeInTheDocument();
      expect(screen.getByTestId('lookup-PELAYARAN')).toBeInTheDocument();
      expect(screen.getByTestId('lookup-STATUS AKTIF')).toBeInTheDocument();
    });

    test('should render correct title based on mode', () => {
      const { rerender } = render(<FormKapalWrapper mode="add" />);
      expect(screen.getByText('Tambah Kapal')).toBeInTheDocument();

      rerender(<FormKapalWrapper mode="edit" />);
      expect(screen.getByText('Edit Kapal')).toBeInTheDocument();

      rerender(<FormKapalWrapper mode="delete" />);
      expect(screen.getByText('Delete Kapal')).toBeInTheDocument();

      rerender(<FormKapalWrapper mode="view" />);
      expect(screen.getByText('View Kapal')).toBeInTheDocument();
    });

    test('should show SAVE & ADD button only in add mode', () => {
      const { rerender } = render(<FormKapalWrapper mode="add" />);
      expect(screen.getByText('SAVE & ADD')).toBeInTheDocument();

      rerender(<FormKapalWrapper mode="edit" />);
      expect(screen.queryByText('SAVE & ADD')).not.toBeInTheDocument();
    });

    test('should show DELETE button text in delete mode', () => {
      render(<FormKapalWrapper mode="delete" />);
      // Button should show DELETE instead of SAVE
      const deleteButtons = screen.getAllByText('DELETE');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Form Validation', () => {
    test('should validate required NAMA field', async () => {
      const mockSubmit = jest.fn();
      render(<FormKapalWrapper onSubmit={mockSubmit} />);

      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/NAMA Harus Diisi/i)).toBeInTheDocument();
      });

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    test('should validate required KETERANGAN field', async () => {
      const mockSubmit = jest.fn();
      render(<FormKapalWrapper onSubmit={mockSubmit} />);

      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/KETERANGAN Harus Diisi/i)).toBeInTheDocument();
      });

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    test('should validate required PELAYARAN_ID field', async () => {
      const mockSubmit = jest.fn();
      render(<FormKapalWrapper onSubmit={mockSubmit} />);

      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/PELAYARAN Harus Diisi/i)).toBeInTheDocument();
      });

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    test('should validate required STATUSAKTIF field', async () => {
      const mockSubmit = jest.fn();
      render(<FormKapalWrapper onSubmit={mockSubmit} />);

      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/STATUSAKTIF Harus Diisi/i)
        ).toBeInTheDocument();
      });

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    test('should accept valid form data', async () => {
      const mockSubmit = jest.fn();
      const validData: Partial<KapalInput> = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: 1,
        pelayaran: 'Pelayaran Test',
        statusaktif: 1,
        statusaktif_nama: 'AKTIF'
      };

      render(
        <FormKapalWrapper defaultValues={validData} onSubmit={mockSubmit} />
      );

      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Form Input Interactions', () => {
    test('should allow typing in NAMA field', async () => {
      render(<FormKapalWrapper />);

      const namaInput = screen.getByLabelText(/NAMA/i) as HTMLInputElement;
      await userEvent.type(namaInput, 'Kapal Baru');

      expect(namaInput.value).toBe('Kapal Baru');
    });

    test('should allow typing in KETERANGAN field', async () => {
      render(<FormKapalWrapper />);

      const keteranganInput = screen.getByLabelText(
        /Keterangan/i
      ) as HTMLInputElement;
      await userEvent.type(keteranganInput, 'Keterangan kapal baru');

      expect(keteranganInput.value).toBe('Keterangan kapal baru');
    });

    test('should handle lookup selection for Pelayaran', async () => {
      render(<FormKapalWrapper />);

      const pelayaranButton = screen.getByTestId('lookup-button-PELAYARAN');
      await userEvent.click(pelayaranButton);

      const hiddenInput = screen.getByTestId(
        'lookup-value-PELAYARAN'
      ) as HTMLInputElement;

      await waitFor(() => {
        expect(hiddenInput.value).toBe('1');
      });
    });

    test('should handle lookup selection for Status Aktif', async () => {
      render(<FormKapalWrapper />);

      const statusAktifButton = screen.getByTestId(
        'lookup-button-STATUS AKTIF'
      );
      await userEvent.click(statusAktifButton);

      const hiddenInput = screen.getByTestId(
        'lookup-value-STATUS AKTIF'
      ) as HTMLInputElement;

      await waitFor(() => {
        expect(hiddenInput.value).toBe('1');
      });
    });

    test('should display pre-filled data in edit mode', () => {
      const existingData: Partial<KapalInput> = {
        id: 1,
        nama: 'Kapal Existing',
        keterangan: 'Keterangan Existing',
        pelayaran_id: 1,
        pelayaran: 'Pelayaran Existing',
        statusaktif: 1,
        statusaktif_nama: 'AKTIF'
      };

      render(<FormKapalWrapper mode="edit" defaultValues={existingData} />);

      const namaInput = screen.getByLabelText(/NAMA/i) as HTMLInputElement;
      expect(namaInput.value).toBe('Kapal Existing');

      const keteranganInput = screen.getByLabelText(
        /Keterangan/i
      ) as HTMLInputElement;
      expect(keteranganInput.value).toBe('Keterangan Existing');
    });
  });

  describe('Form Modes (Add, Edit, View, Delete)', () => {
    test('should allow input in add mode', () => {
      render(<FormKapalWrapper mode="add" />);

      const namaInput = screen.getByLabelText(/NAMA/i) as HTMLInputElement;
      const keteranganInput = screen.getByLabelText(
        /Keterangan/i
      ) as HTMLInputElement;

      expect(namaInput).not.toHaveAttribute('readonly');
      expect(keteranganInput).not.toHaveAttribute('readonly');
    });

    test('should allow input in edit mode', () => {
      render(<FormKapalWrapper mode="edit" />);

      const namaInput = screen.getByLabelText(/NAMA/i) as HTMLInputElement;
      const keteranganInput = screen.getByLabelText(
        /Keterangan/i
      ) as HTMLInputElement;

      expect(namaInput).not.toHaveAttribute('readonly');
      expect(keteranganInput).not.toHaveAttribute('readonly');
    });

    test('should disable inputs in view mode', () => {
      render(<FormKapalWrapper mode="view" />);

      const namaInput = screen.getByLabelText(/NAMA/i) as HTMLInputElement;
      const keteranganInput = screen.getByLabelText(
        /Keterangan/i
      ) as HTMLInputElement;

      expect(namaInput).toHaveAttribute('readonly');
      expect(keteranganInput).toHaveAttribute('readonly');
    });

    test('should disable inputs in delete mode', () => {
      render(<FormKapalWrapper mode="delete" />);

      const namaInput = screen.getByLabelText(/NAMA/i) as HTMLInputElement;
      const keteranganInput = screen.getByLabelText(
        /Keterangan/i
      ) as HTMLInputElement;

      expect(namaInput).toHaveAttribute('readonly');
      expect(keteranganInput).toHaveAttribute('readonly');
    });

    test('should disable save button in view mode', () => {
      render(<FormKapalWrapper mode="view" />);

      const saveButton = screen.getByText('SAVE');
      expect(saveButton).toBeDisabled();
    });

    test('should disable lookups in view mode', () => {
      render(<FormKapalWrapper mode="view" />);

      const pelayaranButton = screen.getByTestId('lookup-button-PELAYARAN');
      const statusAktifButton = screen.getByTestId(
        'lookup-button-STATUS AKTIF'
      );

      expect(pelayaranButton).toBeDisabled();
      expect(statusAktifButton).toBeDisabled();
    });
  });

  describe('Button Actions', () => {
    test('should call onSubmit when SAVE button is clicked', async () => {
      const mockSubmit = jest.fn();
      const validData: Partial<KapalInput> = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: 1,
        statusaktif: 1
      };

      render(
        <FormKapalWrapper defaultValues={validData} onSubmit={mockSubmit} />
      );

      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(false);
      });
    });

    test('should call onSubmit with true parameter when SAVE & ADD is clicked', async () => {
      const mockSubmit = jest.fn();
      const validData: Partial<KapalInput> = {
        nama: 'Kapal Test',
        keterangan: 'Keterangan Test',
        pelayaran_id: 1,
        statusaktif: 1
      };

      render(
        <FormKapalWrapper
          mode="add"
          defaultValues={validData}
          onSubmit={mockSubmit}
        />
      );

      const saveAndAddButton = screen.getByText('SAVE & ADD');
      await userEvent.click(saveAndAddButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(true);
      });
    });

    test('should call handleClose when Cancel button is clicked', async () => {
      const mockHandleClose = jest.fn();
      render(<FormKapalWrapper handleClose={mockHandleClose} />);

      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      expect(mockHandleClose).toHaveBeenCalled();
    });

    test('should call handleClose when close icon is clicked', async () => {
      const mockHandleClose = jest.fn();
      const mockSetPopOver = jest.fn();
      render(
        <FormKapalWrapper
          handleClose={mockHandleClose}
          setPopOver={mockSetPopOver}
        />
      );

      // Find the close button (IoMdClose icon)
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

  describe('Loading States', () => {
    test('should show loading state on SAVE button when isLoadingCreate is true', () => {
      render(<FormKapalWrapper isLoadingCreate={true} />);

      const saveButton = screen.getByText('SAVE');
      expect(saveButton).toHaveAttribute('loading');
    });

    test('should show loading state on SAVE button when isLoadingUpdate is true', () => {
      render(<FormKapalWrapper mode="edit" isLoadingUpdate={true} />);

      const saveButton = screen.getByText('SAVE');
      expect(saveButton).toHaveAttribute('loading');
    });

    test('should show loading state on DELETE button when isLoadingDelete is true', () => {
      render(<FormKapalWrapper mode="delete" isLoadingDelete={true} />);

      const deleteButtons = screen.getAllByText('DELETE');
      expect(deleteButtons[0]).toHaveAttribute('loading');
    });

    test('should disable buttons during loading', () => {
      render(<FormKapalWrapper isLoadingCreate={true} />);

      const saveButton = screen.getByText('SAVE');
      const cancelButton = screen.getByText('Cancel');

      // Save button should have loading attribute
      expect(saveButton).toHaveAttribute('loading');
      // Cancel button should still be enabled
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe('Integration Tests', () => {
    test('should complete full form submission flow', async () => {
      const mockSubmit = jest.fn();
      render(<FormKapalWrapper onSubmit={mockSubmit} />);

      // Fill in all fields
      const namaInput = screen.getByLabelText(/NAMA/i);
      await userEvent.type(namaInput, 'Kapal Integration Test');

      const keteranganInput = screen.getByLabelText(/Keterangan/i);
      await userEvent.type(keteranganInput, 'Keterangan Integration Test');

      // Select Pelayaran
      const pelayaranButton = screen.getByTestId('lookup-button-PELAYARAN');
      await userEvent.click(pelayaranButton);

      // Select Status Aktif
      const statusAktifButton = screen.getByTestId(
        'lookup-button-STATUS AKTIF'
      );
      await userEvent.click(statusAktifButton);

      // Submit form
      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });

    test('should prevent submission with incomplete data', async () => {
      const mockSubmit = jest.fn();
      render(<FormKapalWrapper onSubmit={mockSubmit} />);

      // Only fill NAMA
      const namaInput = screen.getByLabelText(/NAMA/i);
      await userEvent.type(namaInput, 'Kapal Incomplete');

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

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    test('should handle edit mode with existing data', async () => {
      const mockSubmit = jest.fn();
      const existingData: Partial<KapalInput> = {
        id: 1,
        nama: 'Kapal Existing',
        keterangan: 'Keterangan Existing',
        pelayaran_id: 1,
        pelayaran: 'Pelayaran Existing',
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

      // Modify the data
      const namaInput = screen.getByLabelText(/NAMA/i);
      await userEvent.clear(namaInput);
      await userEvent.type(namaInput, 'Kapal Updated');

      // Submit
      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper labels for form fields', () => {
      render(<FormKapalWrapper />);

      expect(screen.getByLabelText(/NAMA/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Keterangan/i)).toBeInTheDocument();
      expect(screen.getByText('Pelayaran')).toBeInTheDocument();
      expect(screen.getByText('Status Aktif')).toBeInTheDocument();
    });

    test('should have required indicators on labels', () => {
      render(<FormKapalWrapper />);

      // Labels should indicate required fields
      const namaLabel = screen.getByText('NAMA').parentElement;
      const keteranganLabel = screen.getByText('Keterangan').parentElement;

      expect(namaLabel).toBeInTheDocument();
      expect(keteranganLabel).toBeInTheDocument();
    });

    test('should show validation errors in accessible way', async () => {
      render(<FormKapalWrapper />);

      const saveButton = screen.getByText('SAVE');
      await userEvent.click(saveButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });
});
