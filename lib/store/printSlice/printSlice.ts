import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TableFilterState {
  [tableKey: string]: {
    page: number;
    limit: number;
    filters: Record<string, any>;
    search: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  };
}

const initialState: TableFilterState = {};

type SetFiltersPayload = {
  tableKey: string;
  values: Partial<{
    page: number;
    limit: number;
    filters: Record<string, any>;
    search: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  }>;
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setReportFilter: (state, action: PayloadAction<SetFiltersPayload>) => {
      const { tableKey, values } = action.payload;
      if (!state[tableKey]) {
        state[tableKey] = {
          page: 1,
          limit: 30,
          filters: {},
          search: '',
          sortBy: 'id',
          sortDirection: 'asc'
        };
      }
      state[tableKey] = {
        ...state[tableKey],
        ...values,
        filters: {
          ...state[tableKey].filters,
          ...values.filters
        }
      };
    },
    resetFilters: (state, action: PayloadAction<string>) => {
      state[action.payload] = {
        page: 1,
        limit: 30,
        filters: {},
        search: '',
        sortBy: 'id',
        sortDirection: 'asc'
      };
    }
  }
});

export const { setReportFilter, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
