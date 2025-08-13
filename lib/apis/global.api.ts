import { api2 } from '../utils/AxiosInstance';

export const checkBeforeDeleteFn = async (
  checks: { id: number; tableName: string; fieldName: string }[]
) => {
  try {
    // Menyusun body secara dinamis berdasarkan parameter yang diterima dalam array
    const requestPayload = checks.map(({ id, tableName, fieldName }) => ({
      tableName: tableName,
      fieldName: fieldName,
      fieldValue: id
    }));

    // Mengirimkan request POST ke API NestJS dengan body yang dinamis
    const response = await api2.post(
      '/global/delete-validation',
      requestPayload
    );

    // Mengembalikan hasil response dari API NestJS
    return response.data;
  } catch (error) {
    console.error('Error during delete validation:', error);
    throw new Error('Validation failed');
  }
};
export const verifyForceEditFn = async (fields: any) => {
  const response = await api2.post(`/global/open-forceedit`, fields);

  return response.data;
};
