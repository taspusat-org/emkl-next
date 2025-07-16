// src/store/logtrailSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IdState {
  header: number; // Ensuring 'header' is always a number, not optional
  detail: number; // Ensuring 'header' is always a number, not optional
}

const initialState: IdState = {
  header: 0, // Initial value as a non-optional number
  detail: 0
};

export const logtrailSlice = createSlice({
  name: 'logtrail',
  initialState,
  reducers: {
    setIdHeaderLogtrail: (state, action: PayloadAction<number>) => {
      state.header = action.payload;
    },
    setIdDetailLogtrail: (state, action: PayloadAction<number>) => {
      state.detail = action.payload;
    },
    resetIdLogtrail: (state) => {
      state.header = 0;
    }
  }
});

export const { setIdHeaderLogtrail, setIdDetailLogtrail, resetIdLogtrail } =
  logtrailSlice.actions;

export default logtrailSlice.reducer;
