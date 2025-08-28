import { GetParams } from '../types/all.type';
import { IAllBank, IBank } from '../types/bank.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { AlatbayarInput } from '../validations/alatbayar.validation';

interface UpdateMenuParams {
  id: string;
  fields: AlatbayarInput;
}

export const getAlatbayarFn = async (
  filters: GetParams = {}
): Promise<IAllBank> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/alatbayar', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching alat bayar:', error);
    throw new Error('Failed to fetch alat bayar');
  }
};
export const deleteAlatbayarFn = async (id: string) => {
  try {
    const response = await api2.delete(`/alatbayar/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateAlatbayarFn = async ({ id, fields }: UpdateMenuParams) => {
  const response = await api2.put(`/alatbayar/update/${id}`, fields);
  return response.data;
};

export const storeAlatbayarFn = async (fields: AlatbayarInput) => {
  const response = await api2.post(`/alatbayar`, fields);

  return response.data;
};
export const exportAlatbayarFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/alatbayar/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};
// Correctly typed 'ids' and sending proper data format to the NestJS API
// export const reportMenuBySelectFn = async (ids: { id: number }[]) => {
//   try {
//     // Sending the data in the correct format to the NestJS API
//     const response = await api2.post(`/menu/report-byselect`, ids);

//     return response.data; // Assuming the API returns the data properly
//   } catch (error) {
//     console.error('Error in sending data:', error);
//     throw new Error('Failed to send data to the API');
//   }
// };

// export const exportMenuBySelectFn = async (ids: { id: number }[]) => {
//   try {
//     const response = await api2.post('/menu/export-byselect', ids, {
//       responseType: 'blob'
//     });

//     return response.data; // Return the Blob file from response
//   } catch (error) {
//     console.error('Error exporting data:', error);
//     throw new Error('Failed to export data');
//   }
// };

// export const updateMenuResequenceFn = async (data: any) => {
//   await api2.put(`/menu/update-resequence`, data);
// };
