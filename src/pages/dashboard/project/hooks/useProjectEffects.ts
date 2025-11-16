/**
 * Hook for project-level side effects (analytics, workflows, cleanup)
 * Single Responsibility: Project lifecycle effects
 */

import { useEffect } from 'react';

import analytics from '../../../../lib/analytics';
import {
  clearCurrentAltaner,
  loadDisplayModeForProject,
} from '../../../../redux/slices/altaners';
import { getAccountAttribute } from '../../../../redux/slices/general/index';
import { clearRoomState } from '../../../../redux/slices/room/slices/roomSlice';
import { dispatch } from '../../../../redux/store';
import type { Altaner, AltanerComponent } from '../types';

interface UseProjectEffectsProps {
  altanerId: string;
  altaner: Altaner | null;
  currentComponent: AltanerComponent | null;
  sortedComponents: Record<string, AltanerComponent> | null;
  accountId: string | undefined;
  workflowsInitialized: boolean;
  workflowsLoading: boolean;
  isPlansRoute: boolean;
}

const FEATURE_MAP: Record<string, string> = {
  interface: 'interface',
  base: 'cloud',
  agents: 'agents',
  flows: 'agents',
};

export function useProjectEffects({
  altanerId,
  altaner,
  currentComponent,
  sortedComponents,
  accountId,
  workflowsInitialized,
  workflowsLoading,
  isPlansRoute,
}: UseProjectEffectsProps): void {
  // Load display mode and cleanup
  useEffect(() => {
    if (altanerId) {
      void dispatch(loadDisplayModeForProject(altanerId));
    }
    return () => {
      dispatch(clearCurrentAltaner());
      dispatch(clearRoomState());
    };
  }, [altanerId]);

  // Fetch workflows if needed
  useEffect(() => {
    if (!accountId || !sortedComponents) return;

    const hasFlowComponent = Object.values(sortedComponents).some(
      (comp) => comp.type === 'flows' || comp.type === 'flow',
    );

    if (hasFlowComponent && !workflowsInitialized && !workflowsLoading) {
      void dispatch(getAccountAttribute(accountId, ['workflows']));
    }
  }, [accountId, sortedComponents, workflowsInitialized, workflowsLoading]);

  // Track feature usage
  useEffect(() => {
    if (currentComponent && altaner && !isPlansRoute) {
      const featureName = FEATURE_MAP[currentComponent.type];

      if (featureName) {
        void analytics.featureUsed(featureName, {
          component_id: currentComponent.id,
          project_id: altanerId,
          component_type: currentComponent.type,
        });
      }
    }
  }, [currentComponent, altanerId, isPlansRoute, altaner]);
}
