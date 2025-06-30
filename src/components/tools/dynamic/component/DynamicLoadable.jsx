import { Skeleton } from '@mui/material';
import { Suspense } from 'react';

const SkeletonLoading = (
  <Skeleton
    variant="rectangular"
    width="100%"
    height={30}
    style={{ borderRadius: 5 }}
  />
);

export const DynamicLoadable = (Component) => (props) => (
  <Suspense fallback={SkeletonLoading}>
    <Component {...props} />
  </Suspense>
);
