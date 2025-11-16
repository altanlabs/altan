/**
 * Tab Selectors
 * Selectors for tab state
 */
import { createSelector } from '@reduxjs/toolkit';

import type { RootState, TabsState, Tab } from '../types/state';

export const selectTabs = (state: RootState): TabsState => state.room._tabs.tabs;

export const selectTabsById = (state: RootState): Record<string, Tab> => selectTabs(state).byId;

export const selectTabsAllIds = (state: RootState): string[] => selectTabs(state).allIds;

export const selectActiveTabId = (state: RootState): string | null => selectTabs(state).activeTabId;

export const selectActiveTab = createSelector(
  [selectTabsById, selectActiveTabId],
  (tabsById: Record<string, Tab>, activeTabId: string | null): Tab | null =>
    activeTabId ? tabsById[activeTabId] : null,
);

export const selectTabsCount = createSelector(
  [selectTabsAllIds],
  (allIds: string[]): number => allIds.length,
);

export const selectTabsArray = createSelector(
  [selectTabsById, selectTabsAllIds],
  (tabsById: Record<string, Tab>, allIds: string[]): Tab[] => allIds.map((id) => tabsById[id]),
);

export const makeSelectTabById = (): ReturnType<typeof createSelector> =>
  createSelector(
    [selectTabsById, (_state: RootState, tabId: string) => tabId],
    (tabsById: Record<string, Tab>, tabId: string): Tab => tabsById[tabId],
  );

