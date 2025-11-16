/**
 * Hook for managing route state and navigation
 * Single Responsibility: Route management logic
 */

import type { History, Location } from 'history';
import { useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import {
  setOperateMode,
  selectOperateMode,
  selectSortedAltanerComponents,
} from '../../../../redux/slices/altaners';
import { useSelector, dispatch } from '../../../../redux/store';
import type { AltanerComponent } from '../../../../services/types';
import type { RouteParams } from '../types';

interface UseRouteManagementResult {
  isPlansRoute: boolean;
  isOperateRoute: boolean;
  operateMode: boolean;
  activeComponentId: string | null;
}

type SortedComponents = Record<string, AltanerComponent> | null;

export function useRouteManagement(params: RouteParams): UseRouteManagementResult {
  const history = useHistory() as History;
  const location = useLocation() as Location;
  const operateMode = useSelector(selectOperateMode) as boolean;
  const sortedComponents = useSelector(selectSortedAltanerComponents) as SortedComponents;

  // Track if we've already cleared thread_id to prevent loops
  const threadIdClearedRef = useRef(false);

  const isPlansRoute = location.pathname.includes('/plans');
  const isOperateRoute = location.pathname.endsWith('/operate');
  const activeComponentId = params.componentId ?? null;

  // Sync operate mode with URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const modeParam = searchParams.get('mode');
    const shouldBeOperateMode = isOperateRoute || modeParam === 'operate';

    if (shouldBeOperateMode !== operateMode) {
      dispatch(setOperateMode(shouldBeOperateMode));
    }
  }, [location.search, location.pathname, operateMode, isOperateRoute]);

  // Clear thread_id on plans route (with loop prevention)
  useEffect(() => {
    // Reset the flag when we leave plans route
    if (!isPlansRoute) {
      threadIdClearedRef.current = false;
      return;
    }

    // Only clear if we're in plans route, thread_id exists, and we haven't already cleared it
    if (isPlansRoute && !threadIdClearedRef.current) {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.has('thread_id')) {
        threadIdClearedRef.current = true;
        searchParams.delete('thread_id');
        history.replace({
          pathname: location.pathname,
          search: searchParams.toString(),
        });
      }
    }
  }, [isPlansRoute, location.pathname, location.search, history]);

  // Redirect to first component if needed
  useEffect(() => {
    if (isPlansRoute || isOperateRoute) return;

    if (sortedComponents && Object.keys(sortedComponents).length > 0) {
      const firstComponentId = Object.keys(sortedComponents)[0];
      if (!firstComponentId) return;

      if (!activeComponentId) {
        const currentSearch = window.location.search;
        history.push(`/project/${params.altanerId}/c/${firstComponentId}${currentSearch}`);
      } else if (!sortedComponents[activeComponentId]) {
        const currentSearch = window.location.search;
        history.replace(`/project/${params.altanerId}/c/${firstComponentId}${currentSearch}`);
      }
    }
  }, [activeComponentId, sortedComponents, params.altanerId, history, isPlansRoute, isOperateRoute]);

  return {
    isPlansRoute,
    isOperateRoute,
    operateMode,
    activeComponentId,
  };
}
