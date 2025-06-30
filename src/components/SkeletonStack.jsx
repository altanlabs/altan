import { Stack, Skeleton } from '@mui/material';
import React from 'react';

const SkeletonStack = ({ count, height }) => {
  return (
    <Stack spacing={-2}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          key={index}
          sx={{ height: height }}
        />
      ))}
    </Stack>
  );
};

export default SkeletonStack;
