import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AcosState {
  data: Record<string, any>; // Data akan disimpan berdasarkan key yang dinamis
  type: Record<string, string>;
  isdefault: Record<string, string>;
  openName: string; // Menambahkan openName ke dalam state
  openNameModal: string; // Menambahkan openName ke dalam state
  focus: string; // Menambahkan openName ke dalam state
  clearLookup: boolean; // Menambahkan openName ke dalam state
  submitClicked: boolean; // Menambahkan openName ke dalam state
  errorLookups: { label: string; order: number }[]; // Track lookup errors dengan urutan
}

const initialState: AcosState = {
  data: {}, // Default kosong, akan menyimpan data berdasarkan key
  type: {}, // Default type kosong
  isdefault: {}, // Default type kosong
  openName: '', // Default openName kosong
  openNameModal: '', // Default openName kosong
  focus: '', // Default openName kosong
  clearLookup: false, // Default openName kosong
  submitClicked: false, // Default openName kosong
  errorLookups: [] // Track lookup yang error
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
    setOpenNameModal(state, action: PayloadAction<string>) {
      state.openNameModal = action.payload;
    },
    setFocusLookup(state, action: PayloadAction<string>) {
      state.focus = action.payload;
    },
    clearOpenName(state) {
      state.openName = ''; // Clears the openName
    },
    clearOpenNameModal(state) {
      state.openNameModal = ''; // Clears the openName
    },
    addErrorLookup(
      state,
      action: PayloadAction<{ label: string; order: number }>
    ) {
      // Tambah ke array jika belum ada
      const exists = state.errorLookups.find(
        (item) => item.label === action.payload.label
      );
      if (!exists) {
        state.errorLookups.push(action.payload);
        // Sort berdasarkan order
        state.errorLookups.sort((a, b) => a.order - b.order);
      }
    },
    removeErrorLookup(state, action: PayloadAction<string>) {
      // Hapus dari array
      state.errorLookups = state.errorLookups.filter(
        (item) => item.label !== action.payload
      );
    },
    clearErrorLookups(state) {
      state.errorLookups = [];
    }
  }
});

export const {
  setData,
  setType,
  setDefault,
  setOpenName,
  setOpenNameModal,
  clearOpenName,
  setClearLookup,
  setFocusLookup,
  setSubmitClicked,
  clearOpenNameModal,
  addErrorLookup,
  removeErrorLookup,
  clearErrorLookups
} = lookupSlice.actions;

export default lookupSlice.reducer;
