import { GetParams } from '../types/all.type';
import { IAllKapal, IKapal } from '../types/kapal.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { KapalInput } from '../validations/kapal.validation';
import { MenuInput } from '../validations/menu.validation';

interface UpdateMenuParams {
  id: string;
  fields: KapalInput;
}

export const getKapalFn = async (
  filters: GetParams = {},
  signal?: AbortSignal
): Promise<IAllKapal> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/kapal', {
      params: queryParams,
      signal
    });

    return response.data;
  } catch (error) {
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }
    console.error('Error fetching data', error);
    throw new Error('Failed to fetch data');
  }
};
export const deleteKapalFn = async (id: string) => {
  try {
    const response = await api2.delete(`/kapal/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateKapalFn = async ({ id, fields }: UpdateMenuParams) => {
  const response = await api2.put(`/kapal/update/${id}`, fields);
  return response.data;
};

export const storeKapalFn = async (fields: KapalInput) => {
  const response = await api2.post(`/kapal`, fields);

  return response.data;
};

export const exportKapalFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/kapal/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
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
