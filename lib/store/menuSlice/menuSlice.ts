// src/store/menuSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ItemMenu {
  url: string;
}
export interface Menu {
  id: number;
  title: string;
  aco_id: number;
  icon: string;
  isActive: number;
  parentId: number;
  url: string;
  order: number;
  items: string;
}

interface MenuState {
  value: Menu[];
}

const initialState: MenuState = {
  value: [] // Initial state as an empty array
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenu: (state, action: PayloadAction<Menu[]>) => {
      state.value = action.payload; // Replace the current state with new details
    },
    resetMenu: (state) => {
      state.value = []; // Reset details to an empty array
    }
  }
});

export const { setMenu, resetMenu } = menuSlice.actions;

export default menuSlice.reducer;
