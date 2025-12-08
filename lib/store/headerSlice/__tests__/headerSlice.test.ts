import headerReducer, { setHeaderData, clearHeaderData } from '../headerSlice';

describe('Header Slice', () => {
  const initialState = {
    headerData: {},
    detailData: {},
    urlApproval: ''
  };

  test('should return initial state', () => {
    expect(headerReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should handle setHeaderData', () => {
    const testData = {
      id: 1,
      nobukti: 'TEST-001',
      tglbukti: '2024-01-01',
      keterangan: 'Test data'
    };

    const state = headerReducer(initialState, setHeaderData(testData));
    expect(state.headerData).toEqual(testData);
  });

  test('should handle clearHeaderData', () => {
    const stateWithData = {
      headerData: {
        id: 1,
        nobukti: 'TEST-001'
      }
    };

    const state = headerReducer(stateWithData, clearHeaderData());
    expect(state.headerData).toEqual({});
  });

  test('should update existing header data', () => {
    const initialData = {
      id: 1,
      nobukti: 'TEST-001'
    };

    const stateWithData = headerReducer(
      initialState,
      setHeaderData(initialData)
    );

    const updatedData = {
      id: 1,
      nobukti: 'TEST-002',
      tglbukti: '2024-01-02'
    };

    const updatedState = headerReducer(
      stateWithData,
      setHeaderData(updatedData)
    );
    expect(updatedState.headerData).toEqual(updatedData);
  });
});
