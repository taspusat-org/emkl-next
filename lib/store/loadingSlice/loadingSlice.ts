// src/redux/loadingSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state of loading
interface LoadingState {
  isLoading: boolean;
  isProcessing: boolean;
}

const initialState: LoadingState = {
  isLoading: false,
  isProcessing: false
};

// Create the loading slice
const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.isLoading = true; // Set loading to true
    },
    setProcessing: (state) => {
      state.isProcessing = true; // Set loading to true
    },
    setLoaded: (state) => {
      state.isLoading = false; // Set loading to false
    },
    setProcessed: (state) => {
      state.isProcessing = false; // Set loading to false
    }
  }
});

// Export actions and reducer
export const { setLoading, setLoaded, setProcessed, setProcessing } =
  loadingSlice.actions;
export default loadingSlice.reducer;
