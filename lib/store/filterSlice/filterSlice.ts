import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  selectedDate: string;
  selectedDate2: string;
  selectedKaryawan1: string;
  selectedKaryawan2: string;
  selectedYear: string;
  selectedBank: string;
  onReload: boolean; // Add the new onReload property here
}

const initialState: FilterState = {
  selectedDate: '',
  selectedDate2: '',
  selectedKaryawan1: '',
  selectedKaryawan2: '',
  selectedYear: '',
  selectedBank: '',
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
    setOnReload(state, action: PayloadAction<boolean>) {
      state.onReload = action.payload; // Handle the onReload state
    },
    clearFilter(state) {
      state.selectedDate = '';
      state.selectedDate2 = '';
      state.selectedKaryawan1 = '';
      state.selectedKaryawan2 = '';
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
  setOnReload, // Export the action to update onReload
  clearFilter,
  clearOnReload
} = filterSlice.actions;

export default filterSlice.reducer;
