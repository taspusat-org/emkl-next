// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

import idReducer from './idSlice/idSlice';
import collapseReducer from './collapseSlice/collapseSlice';
import authReducer from './authSlice/authSlice';
import menuReducer from './menuSlice/menuSlice';
import searchReducer from './searchLookupSlice/searchLookupSlice';
import lookupReduce from './lookupSlice/lookupSlice';
import roleaclReducer from './roleaclSlice/roleaclSlice';
import userReducer from './userSlice/userSlice';
import logtrailReducer from './logtrailSlice/logtrailSlice';
import fieldLengthReducer from './field-length/fieldLengthSlice';
import reportReducer from './reportSlice/reportSlice';
import headerReducer from './headerSlice/headerSlice';
import filterReducer from './filterSlice/filterSlice';
import loadingReducer from './loadingSlice/loadingSlice';
import tabReducer from './tabSlice/tabSlice';
import selectLookupReducer from './selectLookupSlice/selectLookupSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'menu', 'search', 'report'] // Disimpan secara persist
};

const rootReducer = combineReducers({
  id: idReducer,
  collapse: collapseReducer,
  logtrail: logtrailReducer,
  lookup: lookupReduce,
  fieldLength: fieldLengthReducer,
  auth: authReducer,
  roleacl: roleaclReducer,
  filter: filterReducer,
  menu: menuReducer,
  search: searchReducer,
  user: userReducer,
  report: reportReducer,
  loading: loadingReducer,
  header: headerReducer,
  selectLookup: selectLookupReducer,
  tab: tabReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});

export const persistor = persistStore(store);

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
