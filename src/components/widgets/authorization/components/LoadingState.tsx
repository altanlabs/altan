import React, { memo } from 'react';
import { Skeleton } from '../../../ui/skeleton';

export const LoadingState = memo(() => {
  return (
    <div className="px-3 py-2">
      <Skeleton className="h-4 w-3/5 mb-2" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
});

LoadingState.displayName = 'LoadingState';

