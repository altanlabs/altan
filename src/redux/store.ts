import { configureStore, type ThunkAction, type Action } from '@reduxjs/toolkit';
import { useDispatch as useAppDispatch, useSelector as useAppSelector, type TypedUseSelectorHook } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';

import rootReducer, { rootPersistConfig } from './rootReducer';

// ----------------------------------------------------------------------

export const store = configureStore({
  reducer: persistReducer(rootPersistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);

export const { dispatch } = store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// AppThunk type for typed thunks
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Export typed hooks
export const useSelector: TypedUseSelectorHook<RootState> = useAppSelector;
export const useDispatch = (): AppDispatch => useAppDispatch<AppDispatch>();

