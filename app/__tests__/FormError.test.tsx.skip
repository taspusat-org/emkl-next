import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form'; // Untuk mengakses form context
import FormError from '../dashboard/error/components/FormError';

// Mocking fungsi onSubmit dan store (Redux)
jest.mock('../../lib/utils/AxiosInstance', () => ({
  api: {
    post: jest.fn(),
    delete: jest.fn(),
    update: jest.fn()
  }
}));

// Definisikan tipe untuk props FormError
interface FormErrorProps {
  popOver: boolean;
  setPopOver: React.Dispatch<React.SetStateAction<boolean>>;
  forms: any; // Tipe forms menggunakan react-hook-form
  onSubmit: (data: any) => void;
  deleteMode: boolean;
  handleClose: () => void;
  isLoadingCreate: boolean;
  isLoadingUpdate: boolean;
  viewMode: boolean;
  isLoadingDelete: boolean;
}

describe('FormError Component', () => {
  const mockOnSubmit = jest.fn();
  const mockHandleClose = jest.fn();

  const Wrapper = () => {
    const methods = useForm();
    return (
      <FormProvider {...methods}>
        <FormError
          popOver={true}
          setPopOver={jest.fn()}
          forms={methods}
          onSubmit={mockOnSubmit}
          deleteMode={false}
          handleClose={mockHandleClose}
          isLoadingCreate={false}
          isLoadingUpdate={false}
          viewMode={false}
          isLoadingDelete={false}
        />
      </FormProvider>
    );
  };

  //   test('renders form fields', () => {
  //     render(<Wrapper />);

  //     expect(screen.getByLabelText(/Kode Error/i)).toBeInTheDocument();
  //     expect(screen.getByLabelText(/Keterangan/i)).toBeInTheDocument();
  //     expect(screen.getByLabelText(/Status Aktif/i)).toBeInTheDocument();
  //     expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  //     expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  //   });

  test('allows the user to type in the fields', async () => {
    render(<Wrapper />);

    const kodeInput = screen.getByLabelText(/Kode Error/i);
    const ketInput = screen.getByLabelText(/Keterangan/i);

    await userEvent.type(kodeInput, 'ERR001');
    await userEvent.type(ketInput, 'DESKRIPSI ERROR');

    expect(kodeInput).toHaveValue('ERR001');
    expect(ketInput).toHaveValue('DESKRIPSI ERROR');
  });

  test('cancel button works', async () => {
    render(<Wrapper />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockHandleClose).toHaveBeenCalled();
    });
  });
});
