// lib/store/menuSlice/menuSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MenuState {
  menuData: string | null;
  isLoaded: boolean;
}

const initialState: MenuState = {
  menuData: null,
  isLoaded: false
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenuData: (state, action: PayloadAction<string>) => {
      state.menuData = action.payload;
      state.isLoaded = true;
    },
    clearMenuData: (state) => {
      state.menuData = null;
      state.isLoaded = false;
    }
  }
});

export const { setMenuData, clearMenuData } = menuSlice.actions;
export default menuSlice.reducer;
