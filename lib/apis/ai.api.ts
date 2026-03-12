import { api2 } from '../utils/AxiosInstance';
import { getSession, signOut } from 'next-auth/react';

async function getAuthHeader() {
  try {
    const session = await getSession();

    if (session?.error) {
      console.error('⛔ Session has error, logging out...');
      await signOut({ redirect: true });
      return {};
    }

    if (session?.token) {
      return {
        Authorization: `Bearer ${session.token}`
      };
    }

    console.warn('⚠️ No session token found');
    return {};
  } catch (error) {
    console.error('❌ Failed to initialize token:', error);
    return {};
  }
}

export const aiCheckFn = async () => {
  const headers = await getAuthHeader();
  const res = await api2.get('/ai/check', { headers });
  return res.data;
};

export const aiSendMessageFn = async (payload: {
  message: string;
  useAI: boolean;
}) => {
  const headers = await getAuthHeader();
  const res = await api2.post('/ai/process', payload, { headers });
  return res.data;
};

export const aiClearHistoryFn = async () => {
  const headers = await getAuthHeader();
  const res = await api2.post('/ai/clear', {}, { headers });
  return res.data;
};
