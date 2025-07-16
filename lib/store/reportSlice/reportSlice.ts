import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReportDataState {
  reportData: Record<string, any>[];
}

const initialState: ReportDataState = {
  reportData: []
};

const reportData = createSlice({
  name: 'report-data',
  initialState,
  reducers: {
    setReportData(state, action: PayloadAction<Record<string, any>[]>) {
      state.reportData = action.payload;
    }
  }
});

export const { setReportData } = reportData.actions;
export default reportData.reducer;
