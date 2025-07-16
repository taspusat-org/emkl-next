// src/store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface IJabatan {
  id: number;
  nama: string;
  keterangan: string;
  text: string;
  statusaktif: number;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}

interface JabatanState {
  value: IJabatan | null; // Role ACL details
}

const initialState: JabatanState = {
  value: null // Initially no role selected
};

export const jabatanSlice = createSlice({
  name: 'jabatan',
  initialState,
  reducers: {
    // Action to set role ACL details
    setJabatan: (state, action: PayloadAction<IJabatan>) => {
      state.value = action.payload; // Update role details
    },
    // Action to reset role ACL details
    resetJabatan: (state) => {
      state.value = null; // Reset to null when no role is selected
    }
  }
});

// Export actions
export const { setJabatan, resetJabatan } = jabatanSlice.actions;

// Export reducer
export default jabatanSlice.reducer;
