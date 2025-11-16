/**
 * Real-time updates thunks
 */

import type { AppDispatch } from '../../../store';
import { integrateRealTimeUpdates } from '../slices/realtime.slice';
import type { RealTimeUpdates } from '../types';

export const handleRealTimeUpdates =
  (tableId: string, updates: RealTimeUpdates) => async (dispatch: AppDispatch): Promise<{success: boolean; processed: number}> => {
    try {
      const { additions = [], updates: modifications = [], deletions = [] } = updates;

      if (additions.length > 0 || modifications.length > 0 || deletions.length > 0) {
        dispatch(
          integrateRealTimeUpdates({
            tableId,
            updates: modifications.length > 0 ? modifications : undefined,
            additions: additions.length > 0 ? additions : undefined,
            deletions:
              deletions.length > 0
                ? deletions.map((id) => (typeof id === 'string' ? id : String(id)))
                : undefined,
          }),
        );
      }

      return {
        success: true,
        processed: additions.length + modifications.length + deletions.length,
      };
    } catch (error) {
      throw error;
    }
  };

