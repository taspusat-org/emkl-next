import { createContext, useContext, useState, ReactNode } from 'react';

interface IFormErrorContext {
  errors: Record<string, string>;
  setError: (field: string, message: string) => void;
  clearError: (field?: string) => void;
}

const FormErrorContext = createContext<IFormErrorContext | undefined>(
  undefined
);

export const useFormError = () => {
  const context = useContext(FormErrorContext);
  if (!context) {
    throw new Error('useFormError must be used within a FormErrorProvider');
  }
  return context;
};

interface FormErrorProviderProps {
  children: ReactNode;
}

export const FormErrorProvider: React.FC<FormErrorProviderProps> = ({
  children
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setError = (field: string, message: string) => {
    setErrors((prevErrors) => {
      const next = { ...prevErrors, [field]: message };
      console.log('SET ERROR =>', next);
      return next;
    });
  };

  const clearError = (field?: string) => {
    setErrors((prevErrors) => {
      if (field) {
        const { [field]: _, ...rest } = prevErrors;
        return rest;
      } else {
        return {};
      }
    });
  };

  return (
    <FormErrorContext.Provider value={{ errors, setError, clearError }}>
      {children}
    </FormErrorContext.Provider>
  );
};
