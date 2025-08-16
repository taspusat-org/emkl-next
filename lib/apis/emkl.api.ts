import { GetParams } from '../types/all.type';
import { IAllEmkl, IEmkl } from '../types/emkl.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { emklInput } from '../validations/emkl.validation';

interface UpdateMenuParams {
  id: string;
  fields: emklInput;
}

export const getEmklFn = async (filters: GetParams = {}): Promise<IAllEmkl> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/emkl', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching harga emkl:', error);
    throw new Error('Failed to fetch harga emkl');
  }
};
export const deleteEmklFn = async (id: string) => {
  try {
    const response = await api2.delete(`/emkl/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateEmklFn = async ({ id, fields }: UpdateMenuParams) => {
  const response = await api2.put(`/emkl/update/${id}`, fields);
  return response.data;
};

export const storeEmklFn = async (fields: emklInput) => {
  const response = await api2.post(`/emkl`, fields);

  return response.data;
};

export const exportEmklFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/laporanemkl', {
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
