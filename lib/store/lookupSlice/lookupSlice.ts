import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AcosState {
  data: Record<string, any>; // Data akan disimpan berdasarkan key yang dinamis
  type: Record<string, string>;
  isdefault: Record<string, string>;
  openName: string; // Menambahkan openName ke dalam state
  clearLookup: boolean; // Menambahkan openName ke dalam state
  submitClicked: boolean; // Menambahkan openName ke dalam state
}

const initialState: AcosState = {
  data: {}, // Default kosong, akan menyimpan data berdasarkan key
  type: {}, // Default type kosong
  isdefault: {}, // Default type kosong
  openName: '', // Default openName kosong
  clearLookup: false, // Default openName kosong
  submitClicked: false // Default openName kosong
};

const lookupSlice = createSlice({
  name: 'lookupData',
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
    setDefault(
      state,
      action: PayloadAction<{ key: string; isdefault: string }>
    ) {
      const { key, isdefault } = action.payload;
      state.isdefault[key] = isdefault; // Stores the type dynamically by key
    },
    setClearLookup(state, action: PayloadAction<boolean>) {
      state.clearLookup = action.payload; // First set clearLookup
    },
    setSubmitClicked(state, action: PayloadAction<boolean>) {
      state.submitClicked = action.payload; // First set clearLookup
    },
    setOpenName(state, action: PayloadAction<string>) {
      state.openName = action.payload;
    },
    clearOpenName(state) {
      state.openName = ''; // Clears the openName
    }
  }
});

export const {
  setData,
  setType,
  setDefault,
  setOpenName,
  clearOpenName,
  setClearLookup,
  setSubmitClicked
} = lookupSlice.actions;

export default lookupSlice.reducer;
