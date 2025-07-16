// src/store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface IJenisCatatan {
  id: number;
  nama: string;
  keterangan: string;
  statusaktif: number;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}

interface JenisCatatanState {
  value: IJenisCatatan | null; // Role ACL details
}

const initialState: JenisCatatanState = {
  value: null // Initially no role selected
};

export const jeniscatatanSlice = createSlice({
  name: 'jeniscatatan',
  initialState,
  reducers: {
    // Action to set role ACL details
    setJenisCatatan: (state, action: PayloadAction<IJenisCatatan>) => {
      state.value = action.payload; // Update role details
    },
    // Action to reset role ACL details
    resetJenisCatatan: (state) => {
      state.value = null; // Reset to null when no role is selected
    }
  }
});

// Export actions
export const { setJenisCatatan, resetJenisCatatan } = jeniscatatanSlice.actions;

// Export reducer
export default jeniscatatanSlice.reducer;
