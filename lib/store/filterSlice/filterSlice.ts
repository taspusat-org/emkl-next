import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  selectedDate: string;
  selectedDate2: string;
  selectedKaryawan1: string;
  selectedKaryawan2: string;
  selectedYear: string;
  selectedBank: string;
  selectedPengeluaranEmkl: number | null;
  selectedPengeluaranEmklNama: string;
  selectedPenerimaanEmkl: number | null;
  selectedPenerimaanEmklNama: string;
  selectedJenisOrderan: number | null;
  selectedJenisOrderanNama: string;
  onReload: boolean; // Add the new onReload property here
}

const initialState: FilterState = {
  selectedDate: '',
  selectedDate2: '',
  selectedKaryawan1: '',
  selectedKaryawan2: '',
  selectedYear: '',
  selectedBank: '',
  selectedPengeluaranEmkl: null,
  selectedPengeluaranEmklNama: '',
  selectedPenerimaanEmkl: null,
  selectedPenerimaanEmklNama: '',
  selectedJenisOrderan: null,
  selectedJenisOrderanNama: '',
  onReload: false // Initialize the onReload with default value false
};

const filterSlice = createSlice({
  name: 'filter', // Name of the slice
  initialState,
  reducers: {
    setSelectedDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },
    setSelectedDate2(state, action: PayloadAction<string>) {
      state.selectedDate2 = action.payload;
    },
    setSelectedYear(state, action: PayloadAction<string>) {
      state.selectedYear = action.payload;
    },
    setSelectedKaryawan1(state, action: PayloadAction<string>) {
      state.selectedKaryawan1 = action.payload;
    },
    setSelectedKaryawan2(state, action: PayloadAction<string>) {
      state.selectedKaryawan2 = action.payload;
    },
    setSelectedBank(state, action: PayloadAction<string>) {
      state.selectedBank = action.payload;
    },
    setSelectedPengeluaranEmkl(state, action: PayloadAction<number | null>) {
      state.selectedPengeluaranEmkl = action.payload;
    },
    setSelectedPengeluaranEmklNama(state, action: PayloadAction<string>) {
      state.selectedPengeluaranEmklNama = action.payload;
    },
    setSelectedPenerimaanEmkl(state, action: PayloadAction<number | null>) {
      state.selectedPenerimaanEmkl = action.payload;
    },
    setSelectedPenerimaanEmklNama(state, action: PayloadAction<string>) {
      state.selectedPenerimaanEmklNama = action.payload;
    },
    setSelectedJenisOrderan(state, action: PayloadAction<number | null>) {
      state.selectedJenisOrderan = action.payload;
    },
    setSelectedJenisOrderanNama(state, action: PayloadAction<string>) {
      state.selectedJenisOrderanNama = action.payload;
    },
    setOnReload(state, action: PayloadAction<boolean>) {
      state.onReload = action.payload; // Handle the onReload state
    },
    clearFilter(state) {
      state.selectedDate = '';
      state.selectedDate2 = '';
      state.selectedKaryawan1 = '';
      state.selectedKaryawan2 = '';
      state.selectedPengeluaranEmkl = null;
      state.selectedPengeluaranEmklNama = '';
      state.selectedPenerimaanEmkl = null;
      state.selectedPenerimaanEmklNama = '';
      state.selectedJenisOrderan = null;
      state.selectedJenisOrderanNama = '';
      state.onReload = false; // Reset onReload when clearing filters
    },
    clearOnReload(state) {
      state.onReload = false; // Reset onReload when clearing filters
    }
  }
});

export const {
  setSelectedDate,
  setSelectedDate2,
  setSelectedYear,
  setSelectedBank,
  setSelectedKaryawan1,
  setSelectedKaryawan2,
  setSelectedPengeluaranEmkl,
  setSelectedPengeluaranEmklNama,
  setSelectedPenerimaanEmkl,
  setSelectedPenerimaanEmklNama,
  setSelectedJenisOrderan,
  setSelectedJenisOrderanNama,
  setOnReload,
  clearFilter,
  clearOnReload
} = filterSlice.actions;

export default filterSlice.reducer;
