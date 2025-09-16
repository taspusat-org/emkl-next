import { GetParams } from '../types/all.type';
import { IAllMasterBiaya } from '../types/masterbiaya.type';
import { buildQueryParams } from '../utils';
import { api, api2 } from '../utils/AxiosInstance';
import { MasterBiayaInput } from '../validations/masterbiaya.validation';

interface UpdateBiayaParams {
  id: string;
  fields: MasterBiayaInput;
}

export const getMasterBiayaFn = async (
  filters: GetParams = {}
): Promise<IAllMasterBiaya> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/masterbiaya', { params: queryParams });

    return response.data;
  } catch (error) {
    console.error('Error fetching Master Biaya:', error);
    throw new Error('Failed to fetch Master Biaya');
  }
};
export const deleteMasterBiayaFn = async (id: string) => {
  try {
    const response = await api2.delete(`/masterbiaya/${id}`);
    return response.data; // Optionally return response data if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error; // Re-throw the error if you want to handle it in the calling function
  }
};
export const updateMasterBiayaFn = async ({
  id,
  fields
}: UpdateBiayaParams) => {
  const response = await api2.put(`/masterbiaya/update/${id}`, fields);
  return response.data;
};

export const storeMasterBiayaFn = async (fields: MasterBiayaInput) => {
  const response = await api2.post(`/masterbiaya`, fields);

  return response.data;
};

export const exportMasterBiayaFn = async (filters: any): Promise<any> => {
  try {
    const queryParams = buildQueryParams(filters);
    const response = await api2.get('/masterbiaya/export', {
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
