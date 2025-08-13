// src/store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface IForceEdit {
  tableName: string;
  tableValue: string;
}

interface ForceEditState {
  value: IForceEdit | null; // Role ACL details
}

const initialState: ForceEditState = {
  value: null // Initially no role selected
};

export const forceEditSlice = createSlice({
  name: 'forceedit',
  initialState,
  reducers: {
    // Action to set role ACL details
    setForceEdit: (state, action: PayloadAction<IForceEdit>) => {
      state.value = action.payload; // Update role details
    },
    // Action to reset role ACL details
    resetForceEdit: (state) => {
      state.value = null; // Reset to null when no role is selected
    }
  }
});

// Export actions
export const { setForceEdit, resetForceEdit } = forceEditSlice.actions;

// Export reducer
export default forceEditSlice.reducer;
