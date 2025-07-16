import { api2 } from '../utils/AxiosInstance';

export const fieldLength = async (table: string) => {
  try {
    const response = await api2.post(`/fieldlength`, { table: table });
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
