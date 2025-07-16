// src/store/collapseSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface collapseState {
  value: boolean;
}

const initialState: collapseState = {
  value: false // initial value
};

export const collapseSlice = createSlice({
  name: 'collapse',
  initialState,
  reducers: {
    setCollapse: (state, action: PayloadAction<boolean>) => {
      state.value = action.payload;
    },
    resetCollapse: (state) => {
      state.value = false;
    }
  }
});

export const { setCollapse, resetCollapse } = collapseSlice.actions;

export default collapseSlice.reducer;
