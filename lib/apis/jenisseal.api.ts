import { GetParams } from '../types/all.type';
import { IAllJenisseal, IJenisseal } from '../types/jenisseal.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { JenissealInput } from '../validations/jenisseal.validation';
import { MenuInput } from '../validations/menu.validation';

interface UpdateMenuParams {
  id: string;
  fields: JenissealInput;
}

interface validationFields {
  aksi: string;
  value: number | string;
}

export const getJenissealFn = async (
  filters: GetParams = {}
): Promise<IAllJenisseal> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/jenisseal', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching menus:', error);
    throw new Error('Failed to fetch menus');
  }
};
export const deleteJenissealFn = async (id: string) => {
  try {
    const response = await api2.delete(`/jenisseal/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateJenissealFn = async ({ id, fields }: UpdateMenuParams) => {
  const response = await api2.put(`/jenisseal/update/${id}`, fields);
  return response.data;
};

export const storeJenissealFn = async (fields: JenissealInput) => {
  const response = await api2.post(`/jenisseal`, fields);

  return response.data;
};

export const exportJenissealFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/jenisseal/export', {
      params: queryParams,
      responseType: 'blob' // Pastikan respon dalam bentuk Blob
    });

    return response.data; // Return the Blob file from response
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const checkValidationJenissealFn = async (fields: validationFields) => {
  const response = await api2.post(`/jenisseal/check-validation`, fields);

  return response;
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
