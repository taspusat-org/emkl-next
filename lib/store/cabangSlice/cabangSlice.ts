// src/store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface ICabang {
  id: number;
  kodecabang: string;
  namacabang: string;
  keterangan: string;
  statusaktif: number;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}

interface CabangState {
  value: ICabang | null; // Role ACL details
}

const initialState: CabangState = {
  value: null // Initially no role selected
};

export const cabangSlice = createSlice({
  name: 'cabang',
  initialState,
  reducers: {
    // Action to set role ACL details
    setCabang: (state, action: PayloadAction<ICabang>) => {
      state.value = action.payload; // Update role details
    },
    // Action to reset role ACL details
    resetCabang: (state) => {
      state.value = null; // Reset to null when no role is selected
    }
  }
});

// Export actions
export const { setCabang, resetCabang } = cabangSlice.actions;

// Export reducer
export default cabangSlice.reducer;
