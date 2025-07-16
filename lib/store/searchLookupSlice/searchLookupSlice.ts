import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface ILookUpValue {
  id: number;
  type: string;
  field: string;
}
interface lookUpState {
  searchTerm: string;
  firstRow: string;
  value: ILookUpValue | null;
}
const initialState: lookUpState = {
  value: null,
  searchTerm: '',
  firstRow: ''
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFirstRow: (state, action) => {
      state.firstRow = action.payload;
    },
    setLookUpValue: (state, action: PayloadAction<ILookUpValue>) => {
      state.value = action.payload; // Update role details
    }
  }
});

export const { setSearchTerm, setLookUpValue, setFirstRow } =
  searchSlice.actions;
export default searchSlice.reducer;
