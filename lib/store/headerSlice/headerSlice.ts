import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HeaderDataState {
  headerData: Record<string, any>; // Menyimpan objek JSON
  detailData: Record<string, any>; // Menyimpan objek JSON
  urlApproval: string;
}

const initialState: HeaderDataState = {
  headerData: {}, // Inisialisasi dengan objek kosong
  detailData: {},
  urlApproval: ''
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
      state.detailData = {};
      state.urlApproval = '';
    },
    setDetailData(state, action: PayloadAction<Record<string, any>>) {
      state.detailData = action.payload; // Menyimpan objek JSON
    },
    setUrlApproval(state, action: PayloadAction<string>) {
      state.urlApproval = action.payload;
    }
  }
});

export const { setHeaderData, clearHeaderData, setDetailData, setUrlApproval } =
  headerData.actions;
export default headerData.reducer;
