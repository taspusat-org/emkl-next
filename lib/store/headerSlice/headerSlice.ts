import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HeaderDataState {
  headerData: Record<string, any>; // Menyimpan objek JSON
}

const initialState: HeaderDataState = {
  headerData: {} // Inisialisasi dengan objek kosong
};

const headerData = createSlice({
  name: 'header-data',
  initialState,
  reducers: {
    setHeaderData(state, action: PayloadAction<Record<string, any>>) {
      state.headerData = action.payload; // Menyimpan objek JSON
    },
    clearHeaderData(state) {
      state.headerData = {}; // Clear openName (menutup lookup)
    }
  }
});

export const { setHeaderData, clearHeaderData } = headerData.actions;
export default headerData.reducer;
