import { Skeleton, Stack } from '@mui/material';
import { memo } from 'react';

const ThreadMinifiedPlaceholder = () => (
  <div className="overflow-hidden items-start min-w-[200px] mx-auto w-full">
    <Stack direction="row" spacing={2} p={1} alignItems="flex-start">
      <Skeleton variant="circular" width={32} height={32} />
      <Stack spacing={1} width="100%">
        <Skeleton variant="text" width="40%" height={16} />
        <Skeleton variant="text" width="80%" height={20} />
      </Stack>
    </Stack>
  </div>
);

export default memo(ThreadMinifiedPlaceholder);
