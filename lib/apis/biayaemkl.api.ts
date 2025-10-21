import { GetParams } from '../types/all.type';
import { IAllBiayaemkl } from '../types/biayaemkl.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { BiayaemklInput } from '../validations/biayaemkl.validation';

interface UpdateBiayaemklParams {
  id: string;
  fields: BiayaemklInput;
}

export const getBiayaemklFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllBiayaemkl> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/biayaemkl', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching Akun Pusat:', error);
    throw new Error('Failed to fetch Akun Pusat');
  }
};
export const deleteBiayaemklFn = async (id: string) => {
  try {
    const response = await api2.delete(`/biayaemkl/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting biaya emkl:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateBiayaemklFn = async ({
  id,
  fields
}: UpdateBiayaemklParams) => {
  const response = await api2.put(`/biayaemkl/update/${id}`, fields);
  return response.data;
};

export const storeBiayaemklFn = async (fields: BiayaemklInput) => {
  const response = await api2.post(`/biayaemkl`, fields);

  return response.data;
};

export const exportBiayaemklFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/biayaemkl/export', {
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
