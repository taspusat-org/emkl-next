import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AcosState {
  data: Record<string, any>; // Data akan disimpan berdasarkan key yang dinamis
  type: Record<string, string>;
  openName: string; // Menambahkan openName ke dalam state
}

const initialState: AcosState = {
  data: {}, // Default kosong, akan menyimpan data berdasarkan key
  type: {}, // Default type kosong
  openName: '' // Default openName kosong
};

const acosSlice = createSlice({
  name: 'acos',
  initialState,
  reducers: {
    setData(state, action: PayloadAction<{ key: string; data: any }>) {
      const { key, data } = action.payload;
      state.data[key] = data; // Stores the data dynamically by key
    },
    setType(state, action: PayloadAction<{ key: string; type: string }>) {
      const { key, type } = action.payload;
      state.type[key] = type; // Stores the type dynamically by key
    },
    setOpenName(state, action: PayloadAction<string>) {
      state.openName = action.payload;
    },
    clearOpenName(state) {
      state.openName = ''; // Clears the openName
    }
  }
});

export const { setData, setType, setOpenName, clearOpenName } =
  acosSlice.actions;

export default acosSlice.reducer;
