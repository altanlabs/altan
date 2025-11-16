import { useEffect } from 'react';

import {
  fetchPlansByRoomId,
  selectPlanIdsByRoom,
  selectRoomPlansLoading,
  selectRoomPlansError,
} from '@/redux/slices/tasks';
import { useDispatch, useSelector } from '@/redux/store';

interface UsePlansDataReturn {
  planIds: string[];
  isLoading: boolean;
  error: string | null;
}

export const usePlansData = (roomId: string): UsePlansDataReturn => {
  const dispatch = useDispatch();

  // Use optimized cached selector that returns stable reference
  const planIds = useSelector((state) => selectPlanIdsByRoom(state, roomId));
  const isLoading = useSelector(selectRoomPlansLoading(roomId));
  const error = useSelector(selectRoomPlansError(roomId));

  useEffect(() => {
    if (roomId) {
      void dispatch(fetchPlansByRoomId(roomId));
    }
  }, [roomId, dispatch]);

  return {
    planIds,
    isLoading,
    error,
  };
};

