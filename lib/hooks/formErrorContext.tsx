// FormErrorContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

// Definisikan interface untuk context
interface IFormErrorContext {
  errors: Record<string, string>;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
}

// Membuat context
const FormErrorContext = createContext<IFormErrorContext | undefined>(
  undefined
);

// Hook untuk mengakses context
export const useFormError = () => {
  const context = useContext(FormErrorContext);
  if (!context) {
    throw new Error('useFormError must be used within a FormErrorProvider');
  }
  return context;
};

// Provider untuk context
interface FormErrorProviderProps {
  children: ReactNode;
}

export const FormErrorProvider: React.FC<FormErrorProviderProps> = ({
  children
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fungsi untuk mengatur error
  const setError = (field: string, message: string) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: message
    }));
  };

  // Fungsi untuk menghapus error
  const clearError = (field: string) => {
    setErrors((prevErrors) => {
      const { [field]: _, ...rest } = prevErrors;
      return rest;
    });
  };

  return (
    <FormErrorContext.Provider value={{ errors, setError, clearError }}>
      {children}
    </FormErrorContext.Provider>
  );
};
