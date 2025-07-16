// src/store/idSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IdState {
  value: number; // Ensuring 'value' is always a number, not optional
}

const initialState: IdState = {
  value: 0 // Initial value as a non-optional number
};

export const idSlice = createSlice({
  name: 'id',
  initialState,
  reducers: {
    setId: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
    resetId: (state) => {
      state.value = 0;
    }
  }
});

export const { setId, resetId } = idSlice.actions;

export default idSlice.reducer;
