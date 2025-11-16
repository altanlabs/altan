/**
 * Bases (cloud instances) selectors
 */

import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '../../../store';
import type { BasesState } from '../types';

export const selectBasesState = (state: RootState): BasesState | undefined => state.bases;

export const selectBases = createSelector(
  [selectBasesState],
  (state): BasesState['bases'] => state?.bases || {},
);

export const selectBasesLoading = createSelector(
  [selectBasesState],
  (state): boolean => state?.isLoading || false,
);

export const selectBasesError = createSelector(
  [selectBasesState],
  (state): string | null => state?.error || null,
);

export const selectBasesInitialized = createSelector(
  [selectBasesState],
  (state): boolean => state?.initialized || false,
);
