import { GetParams } from '../types/all.type';
import { IAllAkunpusat, IAkunpusat } from '../types/akunpusat.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { AkunpusatInput } from '../validations/akunpusat.validation';

interface UpdateMenuParams {
  id: string;
  fields: AkunpusatInput;
}

export const getAkunpusatFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllAkunpusat> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/akunpusat', {
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
export const deleteAkunpusatFn = async (id: string) => {
  try {
    const response = await api2.delete(`/akunpusat/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateAkunpusatFn = async ({ id, fields }: UpdateMenuParams) => {
  const response = await api2.put(`/akunpusat/update/${id}`, fields);
  return response.data;
};

export const storeAkunpusatFn = async (fields: AkunpusatInput) => {
  const response = await api2.post(`/akunpusat`, fields);

  return response.data;
};
export const exportAkunPusatFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/akunpusat/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data akun pusat:', error);
    throw new Error('Failed to export data akun pusat');
  }
};
// export const exportMenuFn = async (filters: any): Promise<any> => {
//   try {
//     const queryParams = buildQueryParams(filters);
//     const response = await api2.get('/menu/export', {
//       params: queryParams,
//       responseType: 'blob' // Pastikan respon dalam bentuk Blob
//     });

//     return response.data; // Return the Blob file from response
//   } catch (error) {
//     console.error('Error exporting data:', error);
//     throw new Error('Failed to export data');
//   }
// };

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
