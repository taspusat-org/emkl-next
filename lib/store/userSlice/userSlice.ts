// src/store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IUserAcl {
  acoId: number;
  class: string;
  method: string;
  nama: string;
}

export interface IRoleUser {
  id: string;
  rolename: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
}
export interface IUser {
  id: number;
  username: string;
  name: string;
  email: string;
  modifiedby: string;
  created_at: string;
  updated_at: string;
  roles: IRoleUser[];
  acos: IUserAcl[];
}

interface UserState {
  value: IUser | null; // Role ACL details
}

const initialState: UserState = {
  value: null // Initially no role selected
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Action to set role ACL details
    setUser: (state, action: PayloadAction<IUser>) => {
      state.value = action.payload; // Update role details
    },
    // Action to reset role ACL details
    resetUser: (state) => {
      state.value = null; // Reset to null when no role is selected
    }
  }
});

// Export actions
export const { setUser, resetUser } = userSlice.actions;

// Export reducer
export default userSlice.reducer;
