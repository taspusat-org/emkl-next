import { GetParams } from '../types/all.type';
import {
  IAllPackingListDetail,
  IAllPackingListDetailRincian,
  IAllPackingListHeader
} from '../types/packinglist.type';
import { buildQueryParams } from '../utils';
import { api2 } from '../utils/AxiosInstance';
import { PackingListHeaderInput } from '../validations/packinglist.validation';
interface UpdateParams {
  id: string;
  fields: PackingListHeaderInput;
}
export const getPackingListHeaderFn = async (
  filters: GetParams = {}
): Promise<IAllPackingListHeader> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await api2.get('/packinglistheader', {
      params: queryParams
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const getPackingListDetailFn = async (
  filters: GetParams = {}
): Promise<IAllPackingListDetail> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/packinglistdetail`, {
    params: queryParams
  });
  return response.data;
};
export const getPackingListDetailRincianFn = async (
  filters: GetParams = {}
): Promise<IAllPackingListDetailRincian> => {
  const queryParams = buildQueryParams(filters);
  const response = await api2.get(`/packinglistdetailrincian`, {
    params: queryParams
  });
  return response.data;
};
export const storePackingListFn = async (fields: PackingListHeaderInput) => {
  const response = await api2.post(`/packinglistheader`, fields);
  return response.data;
};
export const updatePackingListFn = async ({ id, fields }: UpdateParams) => {
  const response = await api2.put(`/packinglistheader/${id}`, fields);
  return response.data;
};
export const getPackingListReportFn = async (id: number): Promise<any> => {
  try {
    const response = await api2.get(`/packinglistheader/report/${id}`);

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
export const getPackingListSttbReportFn = async (id: number): Promise<any> => {
  try {
    const response = await api2.get(`/packinglistheader/reportsttb/${id}`);

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};
