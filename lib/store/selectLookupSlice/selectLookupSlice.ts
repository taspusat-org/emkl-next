import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectLookupState {
  selectLookup: Record<string, any>; // Menyimpan objek JSON
}

const initialState: SelectLookupState = {
  selectLookup: {} // Inisialisasi dengan objek kosong
};

const selectLookup = createSlice({
  name: 'selectLookup',
  initialState,
  reducers: {
    setSelectLookup(state, action: PayloadAction<{ key: string; data: any }>) {
      const { key, data } = action.payload;
      state.selectLookup[key] = data; // Stores the data dynamically by key
    },
    clearSelectLookup(state) {
      state.selectLookup = {}; // Clear openName (menutup lookup)
    }
  }
});

export const { setSelectLookup, clearSelectLookup } = selectLookup.actions;
export default selectLookup.reducer;
