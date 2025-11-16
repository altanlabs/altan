import { useMemo, useCallback } from 'react';

import type { SnackbarMessage, VariantType } from '@/components/snackbar';
import {
  selectActiveResponsesByThread,
  selectActiveActivationsByThread,
} from '@/redux/slices/room/selectors/lifecycleSelectors';
import { stopThreadGeneration } from '@/redux/slices/room/thunks/threadThunks';
import { useSelector , dispatch } from '@/redux/store';

interface UseThreadGenerationProps {
  threadId: string;
  enqueueSnackbar: (message: SnackbarMessage, options?: { variant?: VariantType }) => void;
}

interface UseThreadGenerationReturn {
  hasActiveGeneration: boolean;
  stopGeneration: () => void;
}

const EMPTY_ARRAY: unknown[] = [];

export const useThreadGeneration = ({
  threadId,
  enqueueSnackbar,
}: UseThreadGenerationProps): UseThreadGenerationReturn => {
  // Create stable selectors
  const selectActiveResponsesStable = useMemo(
    () =>
      threadId && threadId !== 'new' ? selectActiveResponsesByThread(threadId) : () => EMPTY_ARRAY,
    [threadId],
  );

  const selectActiveActivationsStable = useMemo(
    () =>
      threadId && threadId !== 'new'
        ? selectActiveActivationsByThread(threadId)
        : () => EMPTY_ARRAY,
    [threadId],
  );

  const activeResponses = useSelector(selectActiveResponsesStable);
  const activeActivations = useSelector(selectActiveActivationsStable);

  const hasActiveGeneration =
    (Array.isArray(activeResponses) && activeResponses.length > 0) ||
    (Array.isArray(activeActivations) && activeActivations.length > 0);

  const stopGeneration = useCallback(() => {
    if (threadId && threadId !== 'new') {
      dispatch(stopThreadGeneration(threadId))
        .then(() => {
          enqueueSnackbar('Generation stopped', { variant: 'success' });
        })
        .catch(() => {
          enqueueSnackbar('Failed to stop generation', { variant: 'error' });
        });
    }
  }, [threadId, enqueueSnackbar]);

  return {
    hasActiveGeneration,
    stopGeneration,
  };
};

