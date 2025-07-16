// src/store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface IToemail {
  id: number;
  nama: string;
  email: string;
  text: string;
  statusaktif: number;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}

interface ToemailState {
  value: IToemail | null; // Role ACL details
}

const initialState: ToemailState = {
  value: null // Initially no role selected
};

export const toemailSlice = createSlice({
  name: 'toemail',
  initialState,
  reducers: {
    // Action to set role ACL details
    setToemail: (state, action: PayloadAction<IToemail>) => {
      state.value = action.payload; // Update role details
    },
    // Action to reset role ACL details
    resetToemail: (state) => {
      state.value = null; // Reset to null when no role is selected
    }
  }
});

// Export actions
export const { setToemail, resetToemail } = toemailSlice.actions;

// Export reducer
export default toemailSlice.reducer;
