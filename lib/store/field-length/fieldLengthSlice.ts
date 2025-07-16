import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FieldLengthState {
  fieldLength: Record<string, any>[]; // Data dalam bentuk array object fleksibel
}

const initialState: FieldLengthState = {
  fieldLength: [] // Default sebagai array kosong
};

const fieldLength = createSlice({
  name: 'field-length', // Nama slice
  initialState,
  reducers: {
    setFieldLength(state, action: PayloadAction<Record<string, any>[]>) {
      state.fieldLength = action.payload; // Set data array object
    }
  }
});

export const { setFieldLength } = fieldLength.actions;

export default fieldLength.reducer;
