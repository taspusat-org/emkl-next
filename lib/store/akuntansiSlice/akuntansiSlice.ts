// src/store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface IAkuntansi {
  id: number;
  nama: string;
  keterangan: string;
  statusaktif: number;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}

interface AkuntansiState {
  value: IAkuntansi | null; // Role ACL details
}

const initialState: AkuntansiState = {
  value: null // Initially no role selected
};

export const akuntansiSlice = createSlice({
  name: 'akuntansi',
  initialState,
  reducers: {
    // Action to set role ACL details
    setAkuntansi: (state, action: PayloadAction<IAkuntansi>) => {
      state.value = action.payload; // Update role details
    },
    // Action to reset role ACL details
    resetAkuntansi: (state) => {
      state.value = null; // Reset to null when no role is selected
    }
  }
});

// Export actions
export const { setAkuntansi, resetAkuntansi } = akuntansiSlice.actions;

// Export reducer
export default akuntansiSlice.reducer;
