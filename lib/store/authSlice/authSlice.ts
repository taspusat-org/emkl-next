import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  statusaktif: string;
  modifiedby: string;
  karyawan_id: string;
  cabang_nama: string;
  role_id: string[];
  created_at: string;
  updated_at: string;
}
interface AuthState {
  user: User;
  id: string | null;
  cabang_id: string | null;
  token: string | null;
  isRefreshing?: boolean;
  refreshToken: string | null;
  accessTokenExpires: string | undefined; // Gunakan number untuk mempermudah perbandingan waktu
  refreshTokenExpires?: string | undefined; // Gunakan number untuk mempermudah perbandingan waktu
  autoLogoutExpires?: number | null; // Waktu kedaluwarsa untuk auto logout
}

const initialState: AuthState = {
  user: {
    id: '',
    username: '',
    name: '',
    email: '',
    statusaktif: '',
    modifiedby: '',
    role_id: [''],
    karyawan_id: '',
    cabang_nama: '',
    created_at: '',
    updated_at: ''
  },
  id: null,
  token: null,
  refreshToken: null,
  cabang_id: null,
  isRefreshing: false,
  accessTokenExpires: undefined, // Inisialisasi dengan null
  refreshTokenExpires: undefined, // Inisialisasi dengan null
  autoLogoutExpires: null // Inisialisasi dengan null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthState>) => {
      const {
        user,
        id,
        token,
        refreshToken,
        accessTokenExpires,
        refreshTokenExpires,
        cabang_id,
        autoLogoutExpires
      } = action.payload;

      state.user = user;
      state.id = id;
      state.cabang_id = cabang_id;
      state.token = token;
      state.refreshToken = refreshToken;
      state.accessTokenExpires = accessTokenExpires;
      state.refreshTokenExpires = refreshTokenExpires;
      state.autoLogoutExpires = autoLogoutExpires;
    },
    setIsRefreshing(state, action: PayloadAction<boolean>) {
      state.isRefreshing = action.payload; // Set status refresh token
    },
    clearCredentials: (state) => {
      state.user = {
        id: '',
        username: '',
        name: '',
        email: '',
        statusaktif: '',
        modifiedby: '',
        role_id: [''],
        karyawan_id: '',
        cabang_nama: '',
        created_at: '',
        updated_at: ''
      };
      state.id = null;
      state.token = null;
      state.refreshToken = null;
      state.cabang_id = null;
      state.isRefreshing = false;
      state.accessTokenExpires = undefined;
      state.refreshTokenExpires = undefined;
      state.autoLogoutExpires = null;
    }
  }
});

export const { setCredentials, clearCredentials, setIsRefreshing } =
  authSlice.actions;
export default authSlice.reducer;
