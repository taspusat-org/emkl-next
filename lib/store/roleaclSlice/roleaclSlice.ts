// src/store/roleaclSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IRole {
  id: number;
  rolename: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}

interface RoleaclState {
  value: IRole | null; // Role ACL details
  triggerSelectRow: boolean; // Flag to trigger row selection
}

const initialState: RoleaclState = {
  value: null, // Initially no role selected
  triggerSelectRow: false // Initially no trigger to select row
};

export const roleaclSlice = createSlice({
  name: 'roleacl',
  initialState,
  reducers: {
    // Action to set role ACL details
    setRoleacl: (state, action: PayloadAction<IRole>) => {
      state.value = action.payload; // Update role details
    },
    resetRoleacl: (state) => {
      state.value = null; // Reset to null when no role is selected
    },
    // Action to set trigger for selecting row
    setTriggerSelectRow: (state, action: PayloadAction<boolean>) => {
      state.triggerSelectRow = action.payload; // Set the trigger flag
    }
  }
});

// Export actions
export const { setRoleacl, resetRoleacl, setTriggerSelectRow } =
  roleaclSlice.actions;

// Export reducer
export default roleaclSlice.reducer;
