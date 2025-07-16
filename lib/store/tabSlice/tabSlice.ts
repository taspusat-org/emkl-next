// src/store/tabSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface tabState {
  tab: string; // Ensuring 'value' is always a number, not optional
}

const initialState: tabState = {
  tab: '' // Initial value as a non-optional number
};

export const tabSlice = createSlice({
  name: 'tab',
  initialState,
  reducers: {
    setTab: (state, action: PayloadAction<string>) => {
      state.tab = action.payload;
    },
    resetTab: (state) => {
      state.tab = '';
    }
  }
});

export const { setTab, resetTab } = tabSlice.actions;

export default tabSlice.reducer;
